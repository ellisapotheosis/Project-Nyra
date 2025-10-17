"""Tests for core functionality."""

from project_nyra.core import get_version, main


def test_main():
    """Test the main function."""
    result = main()
    assert isinstance(result, str)
    assert "Welcome to Project Nyra" in result
    assert "mortgage assistant" in result


def test_get_version():
    """Test version retrieval."""
    version = get_version()
    assert isinstance(version, str)
    assert version == "0.1.0"


def test_main_not_empty():
    """Test that main returns a non-empty string."""
    result = main()
    assert len(result) > 0
