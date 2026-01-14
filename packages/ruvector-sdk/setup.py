from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="ruvector-sdk",
    version="0.1.0",
    author="Project Nyra Team",
    author_email="dev@nyra.io",
    description="Python SDK for Ruvector distributed vector database",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/nyra/ruvector-sdk",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.9",
    install_requires=[
        "httpx>=0.25.0",
        "numpy>=1.24.0",
        "pydantic>=2.5.0",
        "tenacity>=8.2.3",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.3",
            "pytest-asyncio>=0.21.1",
            "black>=23.11.0",
            "mypy>=1.7.1",
        ],
        "embeddings": [
            "sentence-transformers>=2.2.2",
            "openai>=1.3.7",
        ],
    },
)
