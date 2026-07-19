"""
app/embeddings.py

Semantic similarity engine using Sentence-BERT (SBERT).
Model: 'all-MiniLM-L6-v2' — a strong speed/accuracy tradeoff for
production resume-JD matching (384-dim embeddings, fast CPU inference).
For higher accuracy at higher latency, swap in 'all-mpnet-base-v2'.
"""

from functools import lru_cache
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

MODEL_NAME = "all-MiniLM-L6-v2"

# Loaded once, reused across requests (loading SBERT per-request is
# the #1 latency mistake in naive implementations)
_model = SentenceTransformer(MODEL_NAME)


def get_embedding(text: str) -> np.ndarray:
    """Encodes a single text into its SBERT sentence embedding vector."""
    if not text or not text.strip():
        return np.zeros(_model.get_sentence_embedding_dimension())
    return _model.encode(text, show_progress_bar=False, convert_to_numpy=True)


def get_embeddings_batch(texts: list) -> np.ndarray:
    """Batch-encodes multiple texts at once — far more efficient than
    calling get_embedding() in a loop when scoring many resumes against
    one job description."""
    cleaned = [t if t and t.strip() else " " for t in texts]
    return _model.encode(cleaned, show_progress_bar=False, convert_to_numpy=True, batch_size=32)


def compute_cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """Cosine similarity between two embedding vectors, clipped to [0, 1]
    (SBERT similarities for semantically related text are typically
    positive, but we clip defensively)."""
    sim = cosine_similarity(vec_a.reshape(1, -1), vec_b.reshape(1, -1))[0][0]
    return float(max(0.0, min(1.0, sim)))


def batch_similarity_against_reference(reference_text: str, candidate_texts: list) -> list:
    """Computes cosine similarity of every candidate_text against a single
    reference_text (e.g. many resumes vs. one job description)."""
    ref_vec = get_embedding(reference_text)
    candidate_vecs = get_embeddings_batch(candidate_texts)
    sims = cosine_similarity(ref_vec.reshape(1, -1), candidate_vecs)[0]
    return [float(max(0.0, min(1.0, s))) for s in sims]
