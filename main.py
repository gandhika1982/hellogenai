"""Demonstrate the calculator functions."""

from calculator import add, subtract


def main() -> None:
    """Display example calculator results."""
    first_number = 10
    second_number = 4

    print(f"{first_number} + {second_number} = {add(first_number, second_number)}")
    print(
        f"{first_number} - {second_number} = "
        f"{subtract(first_number, second_number)}"
    )


if __name__ == "__main__":
    main()
