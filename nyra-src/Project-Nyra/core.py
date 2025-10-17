"""Core functionality for Project Nyra."""

import logging

logger = logging.getLogger(__name__)


def main() -> str:
    """Main entry point for Project Nyra.

    Returns:
        str: Welcome message
    """
    message = "Welcome to Project Nyra - AI-powered mortgage assistant!"
    logger.info(message)
    return message


def get_version() -> str:
    """Get the current version of Project Nyra.

    Returns:
        str: Version string
    """
    from . import __version__

    return __version__


if __name__ == "__main__":
    print(main())
