import argparse
import json
import sys
from datetime import date, timedelta
from decimal import Decimal, InvalidOperation


class InputError(ValueError):
    pass


def parse_date(value, field_name):
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        raise InputError(f"{field_name} must be a valid ISO date (YYYY-MM-DD)")


def parse_points(value, issue_key):
    if value is None:
        return None
    try:
        points = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise InputError(f"story_points for {issue_key} must be a non-negative number or null")
    if not points.is_finite() or points < 0:
        raise InputError(f"story_points for {issue_key} must be a non-negative number or null")
    return points


def load_issues(raw):
    try:
        issues = json.loads(raw, parse_float=Decimal, parse_int=Decimal)
    except json.JSONDecodeError as error:
        raise InputError(f"issues must be a JSON array: {error.msg}")
    if not isinstance(issues, list):
        raise InputError("issues must be a JSON array")

    validated = []
    for index, issue in enumerate(issues):
        if not isinstance(issue, dict):
            raise InputError(f"issue at index {index} must be a JSON object")
        key = issue.get("key")
        if not isinstance(key, str) or not key.strip():
            raise InputError(f"issue at index {index} must have a non-empty key")
        if not isinstance(issue.get("is_subtask"), bool):
            raise InputError(f"is_subtask for {key} must be true or false")
        category = issue.get("status_category")
        if not isinstance(category, str) or not category.strip():
            raise InputError(f"status_category for {key} must be a non-empty string")
        points = parse_points(issue.get("story_points"), key)
        validated.append(
            {
                "key": key,
                "status_category": category,
                "story_points": points,
                "is_subtask": issue["is_subtask"],
            }
        )
    return validated


def working_days(start, end):
    count = 0
    current = start
    while current <= end:
        if current.weekday() < 5:
            count += 1
        current += timedelta(days=1)
    return count


def calculate(start, end, as_of, issues):
    if end < start:
        raise InputError("sprint_end must be on or after sprint_start")
    total_days = working_days(start, end)
    if total_days == 0:
        raise InputError("sprint date range must include at least one weekday")

    elapsed_end = min(as_of, end)
    elapsed_days = working_days(start, elapsed_end) if as_of >= start else 0
    remaining_start = max(as_of + timedelta(days=1), start)
    remaining_days = working_days(remaining_start, end) if remaining_start <= end else 0

    top_level = [issue for issue in issues if not issue["is_subtask"]]
    estimated = [issue for issue in top_level if issue["story_points"] is not None]
    total_points = sum((issue["story_points"] for issue in estimated), Decimal(0))
    completed_points = sum(
        (
            issue["story_points"]
            for issue in estimated
            if issue["status_category"].casefold() == "done"
        ),
        Decimal(0),
    )
    remaining_points = total_points - completed_points
    unestimated_count = sum(issue["story_points"] is None for issue in top_level)
    actual = (completed_points / total_points * 100) if total_points > 0 else None
    ideal = Decimal(elapsed_days) / Decimal(total_days) * 100
    gap = actual - ideal if actual is not None else None
    health = (
        "insufficient_estimate_data"
        if actual is None
        else ("at_risk" if gap <= Decimal(-10) else "on_track")
    )

    def number(value):
        return float(value) if value is not None else None

    return {
        "sprint_start": start.isoformat(),
        "sprint_end": end.isoformat(),
        "as_of": as_of.isoformat(),
        "working_days_total": total_days,
        "working_days_elapsed": elapsed_days,
        "working_days_remaining": remaining_days,
        "top_level_issue_count": len(top_level),
        "estimated_issue_count": len(estimated),
        "unestimated_issue_count": unestimated_count,
        "total_story_points": number(total_points),
        "completed_story_points": number(completed_points),
        "remaining_story_points": number(remaining_points),
        "actual_progress_percent": number(actual),
        "ideal_progress_percent": number(ideal),
        "gap_percentage_points": number(gap),
        "health": health,
        "date_convention": "Sprint weekdays are inclusive; elapsed includes as_of when it is a weekday; remaining starts the following day. Weekends are excluded; holidays are not.",
    }


def main():
    parser = argparse.ArgumentParser(
        description="Calculate sprint story-point progress and weekday-based health."
    )
    parser.add_argument("--sprint-start", required=True, help="Sprint start date (YYYY-MM-DD)")
    parser.add_argument("--sprint-end", required=True, help="Sprint end date (YYYY-MM-DD)")
    parser.add_argument("--as-of", required=True, help="Calculation date (YYYY-MM-DD)")
    parser.add_argument(
        "--issues-json",
        required=True,
        help="JSON array of issues with key, status_category, story_points, and is_subtask",
    )
    args = parser.parse_args()

    try:
        result = calculate(
            parse_date(args.sprint_start, "sprint_start"),
            parse_date(args.sprint_end, "sprint_end"),
            parse_date(args.as_of, "as_of"),
            load_issues(args.issues_json),
        )
    except InputError as error:
        parser.error(str(error))
    json.dump(result, sys.stdout, indent=2)
    print()


if __name__ == "__main__":
    main()
