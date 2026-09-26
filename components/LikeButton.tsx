"use client";

import { useState, useSyncExternalStore } from "react";

interface LikeButtonProps {
  slug: string;
  initialLikes: number;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export default function LikeButton({ slug, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);
  const [justLiked, setJustLiked] = useState(false);

  const isStoredLiked = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(`liked_post_${slug}`) === "true";
      } catch {
        return false;
      }
    },
    () => false
  );

  const hasLiked = isStoredLiked || justLiked;

  const handleLike = async () => {
    if (hasLiked || isLiking) return;

    setIsLiking(true);
    setJustLiked(true);
    setLikes((prev) => prev + 1);

    try {
      localStorage.setItem(`liked_post_${slug}`, "true");
      await fetch(`/api/posts/${slug}/like`, { method: "POST" });
    } catch (err) {
      console.error("Erro ao registrar curtida:", err);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      className={`btn-like ${hasLiked ? "is-liked" : ""}`}
      disabled={hasLiked || isLiking}
      aria-label={hasLiked ? "Você curtiu esta postagem" : "Curtir postagem"}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={hasLiked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>
        {likes} {likes === 1 ? "apoio" : "apoios"}
      </span>
      {hasLiked && <span className="like-thanks">· Obrigado!</span>}
    </button>
  );
}
