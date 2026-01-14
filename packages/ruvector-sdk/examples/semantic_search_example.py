#!/usr/bin/env python3
"""
Semantic search example using Ruvector SDK

This example demonstrates:
1. Creating a collection
2. Generating embeddings for documents
3. Inserting documents with embeddings
4. Performing semantic search
5. Filtering by metadata
"""

import asyncio
from ruvector_sdk import (
    RuvectorClient,
    Vector,
    SentenceTransformerEmbeddings,
    DistanceMetric,
)


# Sample mortgage documents
MORTGAGE_DOCS = [
    {
        "id": "doc1",
        "text": "A 30-year fixed-rate mortgage locks in your interest rate for the entire loan term, providing payment stability.",
        "category": "mortgage-types",
        "topic": "fixed-rate",
    },
    {
        "id": "doc2",
        "text": "Adjustable-rate mortgages (ARMs) have interest rates that change over time based on market conditions.",
        "category": "mortgage-types",
        "topic": "arm",
    },
    {
        "id": "doc3",
        "text": "FHA loans are government-backed mortgages that allow for lower down payments, typically 3.5% of the purchase price.",
        "category": "loan-programs",
        "topic": "fha",
    },
    {
        "id": "doc4",
        "text": "VA loans are available to veterans and active military, offering 0% down payment and no PMI requirements.",
        "category": "loan-programs",
        "topic": "va",
    },
    {
        "id": "doc5",
        "text": "Pre-approval is the process where a lender evaluates your financial situation to determine how much you can borrow.",
        "category": "process",
        "topic": "pre-approval",
    },
    {
        "id": "doc6",
        "text": "Closing costs typically range from 2-5% of the loan amount and include fees for appraisal, title insurance, and origination.",
        "category": "costs",
        "topic": "closing-costs",
    },
    {
        "id": "doc7",
        "text": "Your debt-to-income ratio (DTI) is a key factor lenders consider; it should typically be below 43%.",
        "category": "qualification",
        "topic": "dti",
    },
    {
        "id": "doc8",
        "text": "Private Mortgage Insurance (PMI) is required when your down payment is less than 20% of the home price.",
        "category": "costs",
        "topic": "pmi",
    },
]


async def main():
    print("=== Ruvector SDK - Semantic Search Example ===\n")

    # Initialize embedding generator
    print("Initializing embedding generator...")
    embedder = SentenceTransformerEmbeddings("all-MiniLM-L6-v2")
    print(f"Using model with {embedder.dimension()}-dimensional embeddings\n")

    # Connect to Ruvector
    async with RuvectorClient(host="localhost", port=6370) as client:
        # Check health
        if not await client.health_check():
            print("ERROR: Ruvector is not healthy. Please start Ruvector first.")
            return

        print("Connected to Ruvector successfully!")

        # Create collection
        collection_name = "mortgage_knowledge"
        print(f"\nCreating collection '{collection_name}'...")

        try:
            await client.delete_collection(collection_name)
            print("Deleted existing collection")
        except:
            pass

        collection = await client.create_collection(
            name=collection_name,
            dimension=embedder.dimension(),
            distance_metric=DistanceMetric.COSINE,
        )
        print(f"Collection created: {collection.name} ({collection.dimension} dimensions)")

        # Generate embeddings and create vectors
        print("\nGenerating embeddings for documents...")
        texts = [doc["text"] for doc in MORTGAGE_DOCS]
        embeddings = embedder.embed(texts)

        vectors = [
            Vector(
                id=doc["id"],
                vector=emb,
                metadata={
                    "text": doc["text"],
                    "category": doc["category"],
                    "topic": doc["topic"],
                },
            )
            for doc, emb in zip(MORTGAGE_DOCS, embeddings)
        ]

        # Insert vectors
        print(f"Inserting {len(vectors)} vectors...")
        count = await client.upsert(collection_name, vectors)
        print(f"Successfully inserted {count} vectors\n")

        # Example searches
        queries = [
            ("What loan options require no down payment?", None),
            ("How much are typical closing fees?", {"category": "costs"}),
            ("Tell me about fixed interest rates", {"category": "mortgage-types"}),
        ]

        for query, filter_meta in queries:
            print(f"\nQuery: '{query}'")
            if filter_meta:
                print(f"Filter: {filter_meta}")

            # Generate query embedding
            query_vector = embedder.embed(query)

            # Search
            results = await client.search(
                collection=collection_name,
                query_vector=query_vector,
                top_k=3,
                filter=filter_meta,
            )

            print("\nTop 3 Results:")
            for i, result in enumerate(results, 1):
                print(f"\n{i}. [Score: {result.score:.4f}] ({result.metadata['topic']})")
                print(f"   {result.metadata['text']}")

        # Cluster status
        print("\n" + "=" * 60)
        print("Cluster Status:")
        status = await client.cluster_status()
        print(f"Leader: {status.leader}")
        print(f"Followers: {status.followers}")
        print(f"Total Vectors: {status.total_vectors}")
        print(f"Total Collections: {status.total_collections}")


if __name__ == "__main__":
    asyncio.run(main())
