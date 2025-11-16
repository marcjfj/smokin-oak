'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'

interface Leaf {
  id: number
  image: string
  left: number
  size: number
  duration: number
  delay: number
  rotation: number
}

export default function FallingLeaves() {
  const leaves = useMemo(() => {
    const leafImages = [
      '/leaves/leaf1.png',
      '/leaves/leaf2.png',
      '/leaves/leaf3.png',
      '/leaves/leaf4.png',
      '/leaves/leaf5.png',
    ]

    // Generate 15 random leaves
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      image: leafImages[Math.floor(Math.random() * leafImages.length)],
      left: Math.random() * 100, // Random horizontal position (0-100%)
      size: 40 + Math.random() * 60, // Random size between 40-100px
      duration: 8 + Math.random() * 10, // Fall duration 8-18 seconds
      delay: Math.random() * 5, // Start delay 0-5 seconds
      rotation: Math.random() * 360, // Initial rotation
    }))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute animate-fall"
          style={{
            left: `${leaf.left}%`,
            top: '-100px',
            width: `${leaf.size}px`,
            height: `${leaf.size}px`,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.delay}s`,
            transform: `rotate(${leaf.rotation}deg)`,
          }}
        >
          <Image
            src={leaf.image}
            alt="Falling leaf"
            width={leaf.size}
            height={leaf.size}
            className="object-contain opacity-40 animate-sway"
            style={{
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
          }
        }

        @keyframes sway {
          0%,
          100% {
            transform: translateX(0) rotate(0deg);
          }
          25% {
            transform: translateX(20px) rotate(10deg);
          }
          75% {
            transform: translateX(-20px) rotate(-10deg);
          }
        }

        .animate-fall {
          animation: fall linear infinite;
        }

        .animate-sway {
          animation: sway ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
