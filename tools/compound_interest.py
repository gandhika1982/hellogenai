import argparse
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from fractions import Fraction


def main():
    parser = argparse.ArgumentParser(
        description="Calculate compound interest with a nominal annual rate."
    )
    parser.add_argument("--principal", required=True, help="Starting amount")
    parser.add_argument(
        "--annual-rate",
        required=True,
        help="Nominal annual rate as a percentage, for example 7.34",
    )
    parser.add_argument(
        "--compounds-per-year",
        required=True,
        type=int,
        help="Number of compounding periods per year",
    )
    parser.add_argument(
        "--years",
        required=True,
        help="Duration in years; accepts a fraction such as 103/12",
    )
    args = parser.parse_args()

    try:
        principal = Decimal(args.principal)
        annual_rate = Decimal(args.annual_rate)
        years = Fraction(args.years)
    except (InvalidOperation, ValueError, ZeroDivisionError):
        parser.error("principal, annual rate, and years must be valid numbers")

    if not principal.is_finite() or principal < 0:
        parser.error("principal must be a finite, non-negative number")
    if not annual_rate.is_finite() or annual_rate < 0:
        parser.error("annual rate must be a finite, non-negative percentage")
    if args.compounds_per_year <= 0:
        parser.error("compounds per year must be a positive integer")
    if years <= 0:
        parser.error("years must be a positive duration")

    periods = years * args.compounds_per_year
    if periods.denominator != 1:
        parser.error(
            "years multiplied by compounds per year must be a whole number"
        )

    period_count = periods.numerator
    periodic_rate = annual_rate / Decimal(100 * args.compounds_per_year)
    final_amount = principal * (Decimal(1) + periodic_rate) ** period_count
    interest = final_amount - principal
    cent = Decimal("0.01")
    final_amount = final_amount.quantize(cent, rounding=ROUND_HALF_UP)
    interest = interest.quantize(cent, rounding=ROUND_HALF_UP)

    print(f"Final amount: ${final_amount:,.2f}")
    print(f"Interest earned: ${interest:,.2f}")


if __name__ == "__main__":
    main()
