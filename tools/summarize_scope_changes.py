import argparse
import json
import sys
from decimal import Decimal, InvalidOperation


class InputError(ValueError):
    pass


def parse_points(value, index):
    if value is None:
        return None
    try:
        points = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise InputError(f"story_points for change at index {index} must be a non-negative number or null")
    if not points.is_finite() or points < 0:
        raise InputError(f"story_points for change at index {index} must be a non-negative number or null")
    return points


def summarize(raw):
    try:
        changes = json.loads(raw, parse_float=Decimal, parse_int=Decimal)
    except json.JSONDecodeError as error:
        raise InputError(f"changes must be a JSON array: {error.msg}")
    if not isinstance(changes, list):
        raise InputError("changes must be a JSON array")

    totals = {
        "added": Decimal(0),
        "removed": Decimal(0),
    }
    counts = {"added": 0, "removed": 0}
    unknown_counts = {"added": 0, "removed": 0}
    details = []

    for index, change in enumerate(changes):
        if not isinstance(change, dict):
            raise InputError(f"change at index {index} must be a JSON object")
        direction = change.get("direction")
        if direction not in ("added", "removed"):
            raise InputError(f"direction for change at index {index} must be 'added' or 'removed'")
        issue_key = change.get("issue_key")
        if not isinstance(issue_key, str) or not issue_key.strip():
            raise InputError(f"change at index {index} must have a non-empty issue_key")
        points = parse_points(change.get("story_points"), index)
        counts[direction] += 1
        if points is None:
            unknown_counts[direction] += 1
        else:
            totals[direction] += points
        details.append(
            {
                "issue_key": issue_key,
                "direction": direction,
                "story_points": float(points) if points is not None else None,
                "changed_at": change.get("changed_at"),
            }
        )

    return {
        "change_count": len(changes),
        "added_change_count": counts["added"],
        "removed_change_count": counts["removed"],
        "added_story_points_known": float(totals["added"]),
        "removed_story_points_known": float(totals["removed"]),
        "added_unknown_impact_count": unknown_counts["added"],
        "removed_unknown_impact_count": unknown_counts["removed"],
        "net_known_story_point_change": float(totals["added"] - totals["removed"]),
        "changes": details,
        "note": "Known point totals exclude changes whose story_points value is null; unknown impacts are counted separately.",
    }


def main():
    parser = argparse.ArgumentParser(
        description="Summarize sprint scope changes without altering sprint totals."
    )
    parser.add_argument(
        "--changes-json",
        required=True,
        help="JSON array of changes with issue_key, direction, story_points, and optional changed_at",
    )
    args = parser.parse_args()
    try:
        result = summarize(args.changes_json)
    except InputError as error:
        parser.error(str(error))
    json.dump(result, sys.stdout, indent=2)
    print()


if __name__ == "__main__":
    main()
