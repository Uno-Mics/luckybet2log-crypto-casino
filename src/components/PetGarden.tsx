
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePetSystem } from "@/hooks/usePetSystem";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSpring, animated } from "@react-spring/web";

const traitIcons = {
  farming_boost: "⚡",
  staking_boost: "💎", 
  token_multiplier: "⭐",
  luck_boost: "🌟"
};

const traitNames = {
  farming_boost: "Farming Boost",
  staking_boost: "Staking Boost",
  token_multiplier: "Token Multiplier", 
  luck_boost: "Luck Boost"
};

const rarityColors = {
  common: "bg-gray-600",
  uncommon: "bg-green-600",
  rare: "bg-blue-600", 
  legendary: "bg-purple-600",
  mythical: "bg-yellow-600"
};

// Enhanced Pokemon-style full-body pixel pet sprites with proper walking animations
// Map database IDs to correct sprites
const petIdToSpriteMap: { [key: string]: string } = {
  '12': '🔆', // Golden Phoenix (legendary)
  '13': '💚', // Ancient Dragon (legendary) 
  '14': '🌌', // Cosmic Wolf (legendary)
  '15': '✨', // Fortune Spirit (legendary)
  '16': '👑', // Royal Griffin (legendary)
  '17': '⭐', // Eternal Phoenix (mythical)
};

const pokemonPetSprites = {
  '🐣': {
    idle: [
      // Frame 1: Standing still
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="10" fill="#FFFF99"/>
          <!-- Head -->
          <rect x="12" y="8" width="8" height="8" fill="#FFFF99"/>
          <!-- Beak -->
          <rect x="14" y="12" width="4" height="2" fill="#FF8800"/>
          <!-- Eyes -->
          <rect x="13" y="10" width="2" height="2" fill="#000000"/>
          <rect x="17" y="10" width="2" height="2" fill="#000000"/>
          <!-- Wings -->
          <rect x="8" y="18" width="4" height="6" fill="#FFEE77"/>
          <rect x="20" y="18" width="4" height="6" fill="#FFEE77"/>
          <!-- Feet -->
          <rect x="12" y="26" width="3" height="3" fill="#FF8800"/>
          <rect x="17" y="26" width="3" height="3" fill="#FF8800"/>
        </svg>
      `),
      // Frame 2: Slight bob
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="10" fill="#FFFF99"/>
          <!-- Head -->
          <rect x="12" y="7" width="8" height="8" fill="#FFFF99"/>
          <!-- Beak -->
          <rect x="14" y="11" width="4" height="2" fill="#FF8800"/>
          <!-- Eyes -->
          <rect x="13" y="9" width="2" height="2" fill="#000000"/>
          <rect x="17" y="9" width="2" height="2" fill="#000000"/>
          <!-- Wings -->
          <rect x="8" y="17" width="4" height="6" fill="#FFEE77"/>
          <rect x="20" y="17" width="4" height="6" fill="#FFEE77"/>
          <!-- Feet -->
          <rect x="12" y="25" width="3" height="3" fill="#FF8800"/>
          <rect x="17" y="25" width="3" height="3" fill="#FF8800"/>
        </svg>
      `)
    ],
    walking: [
      // Frame 1: Left foot forward
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="10" fill="#FFFF99"/>
          <!-- Head (slight lean forward) -->
          <rect x="13" y="8" width="8" height="8" fill="#FFFF99"/>
          <!-- Beak -->
          <rect x="15" y="12" width="4" height="2" fill="#FF8800"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#000000"/>
          <rect x="18" y="10" width="2" height="2" fill="#000000"/>
          <!-- Wings (flapping) -->
          <rect x="7" y="17" width="5" height="7" fill="#FFEE77"/>
          <rect x="20" y="17" width="5" height="7" fill="#FFEE77"/>
          <!-- Feet (walking) -->
          <rect x="10" y="26" width="3" height="3" fill="#FF8800"/>
          <rect x="18" y="26" width="3" height="3" fill="#FF8800"/>
        </svg>
      `),
      // Frame 2: Right foot forward
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="10" fill="#FFFF99"/>
          <!-- Head (slight lean forward) -->
          <rect x="13" y="8" width="8" height="8" fill="#FFFF99"/>
          <!-- Beak -->
          <rect x="15" y="12" width="4" height="2" fill="#FF8800"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#000000"/>
          <rect x="18" y="10" width="2" height="2" fill="#000000"/>
          <!-- Wings (flapping up) -->
          <rect x="7" y="15" width="5" height="7" fill="#FFEE77"/>
          <rect x="20" y="15" width="5" height="7" fill="#FFEE77"/>
          <!-- Feet (walking) -->
          <rect x="14" y="26" width="3" height="3" fill="#FF8800"/>
          <rect x="17" y="26" width="3" height="3" fill="#FF8800"/>
        </svg>
      `)
    ],
    name: 'Chirpy'
  },
  '🐌': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Shell -->
          <rect x="16" y="8" width="10" height="8" fill="#8B4513"/>
          <rect x="18" y="10" width="6" height="4" fill="#A0522D"/>
          <!-- Body -->
          <rect x="8" y="16" width="16" height="6" fill="#FFCC99"/>
          <!-- Head -->
          <rect x="4" y="18" width="6" height="4" fill="#FFCC99"/>
          <!-- Eyes on stalks -->
          <rect x="2" y="16" width="2" height="2" fill="#000000"/>
          <rect x="6" y="16" width="2" height="2" fill="#000000"/>
          <!-- Tail -->
          <rect x="24" y="20" width="4" height="2" fill="#FFCC99"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Shell -->
          <rect x="16" y="9" width="10" height="8" fill="#8B4513"/>
          <rect x="18" y="11" width="6" height="4" fill="#A0522D"/>
          <!-- Body -->
          <rect x="8" y="17" width="16" height="6" fill="#FFCC99"/>
          <!-- Head -->
          <rect x="4" y="19" width="6" height="4" fill="#FFCC99"/>
          <!-- Eyes on stalks -->
          <rect x="2" y="17" width="2" height="2" fill="#000000"/>
          <rect x="6" y="17" width="2" height="2" fill="#000000"/>
          <!-- Tail -->
          <rect x="24" y="21" width="4" height="2" fill="#FFCC99"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Shell -->
          <rect x="17" y="8" width="10" height="8" fill="#8B4513"/>
          <rect x="19" y="10" width="6" height="4" fill="#A0522D"/>
          <!-- Body (extended) -->
          <rect x="6" y="16" width="18" height="6" fill="#FFCC99"/>
          <!-- Head (extended forward) -->
          <rect x="2" y="18" width="8" height="4" fill="#FFCC99"/>
          <!-- Eyes on stalks -->
          <rect x="1" y="16" width="2" height="2" fill="#000000"/>
          <rect x="5" y="16" width="2" height="2" fill="#000000"/>
          <!-- Tail -->
          <rect x="24" y="20" width="4" height="2" fill="#FFCC99"/>
          <!-- Slime trail -->
          <rect x="6" y="22" width="16" height="1" fill="#90EE90"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Shell -->
          <rect x="16" y="8" width="10" height="8" fill="#8B4513"/>
          <rect x="18" y="10" width="6" height="4" fill="#A0522D"/>
          <!-- Body (contracted) -->
          <rect x="8" y="16" width="16" height="6" fill="#FFCC99"/>
          <!-- Head (pulled back) -->
          <rect x="6" y="18" width="6" height="4" fill="#FFCC99"/>
          <!-- Eyes on stalks -->
          <rect x="4" y="16" width="2" height="2" fill="#000000"/>
          <rect x="8" y="16" width="2" height="2" fill="#000000"/>
          <!-- Tail -->
          <rect x="24" y="20" width="4" height="2" fill="#FFCC99"/>
          <!-- Slime trail -->
          <rect x="8" y="22" width="14" height="1" fill="#90EE90"/>
        </svg>
      `)
    ],
    name: 'Slowmo'
  },
  '🐝': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="12" y="14" width="8" height="10" fill="#FFD700"/>
          <!-- Head -->
          <rect x="14" y="8" width="4" height="6" fill="#FFD700"/>
          <!-- Stripes -->
          <rect x="12" y="16" width="8" height="2" fill="#000000"/>
          <rect x="12" y="20" width="8" height="2" fill="#000000"/>
          <!-- Wings -->
          <rect x="8" y="12" width="6" height="4" fill="#E0E0E0"/>
          <rect x="18" y="12" width="6" height="4" fill="#E0E0E0"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#000000"/>
          <rect x="18" y="10" width="2" height="2" fill="#000000"/>
          <!-- Legs -->
          <rect x="13" y="24" width="2" height="3" fill="#000000"/>
          <rect x="17" y="24" width="2" height="3" fill="#000000"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="12" y="13" width="8" height="10" fill="#FFD700"/>
          <!-- Head -->
          <rect x="14" y="7" width="4" height="6" fill="#FFD700"/>
          <!-- Stripes -->
          <rect x="12" y="15" width="8" height="2" fill="#000000"/>
          <rect x="12" y="19" width="8" height="2" fill="#000000"/>
          <!-- Wings (fluttering) -->
          <rect x="7" y="10" width="7" height="5" fill="#E0E0E0"/>
          <rect x="18" y="10" width="7" height="5" fill="#E0E0E0"/>
          <!-- Eyes -->
          <rect x="14" y="9" width="2" height="2" fill="#000000"/>
          <rect x="18" y="9" width="2" height="2" fill="#000000"/>
          <!-- Legs -->
          <rect x="13" y="23" width="2" height="3" fill="#000000"/>
          <rect x="17" y="23" width="2" height="3" fill="#000000"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (tilted forward) -->
          <rect x="13" y="14" width="8" height="10" fill="#FFD700"/>
          <!-- Head -->
          <rect x="15" y="8" width="4" height="6" fill="#FFD700"/>
          <!-- Stripes -->
          <rect x="13" y="16" width="8" height="2" fill="#000000"/>
          <rect x="13" y="20" width="8" height="2" fill="#000000"/>
          <!-- Wings (active flying) -->
          <rect x="6" y="8" width="8" height="6" fill="#E0E0E0"/>
          <rect x="18" y="8" width="8" height="6" fill="#E0E0E0"/>
          <!-- Eyes -->
          <rect x="15" y="10" width="2" height="2" fill="#000000"/>
          <rect x="19" y="10" width="2" height="2" fill="#000000"/>
          <!-- Legs (walking) -->
          <rect x="12" y="24" width="2" height="3" fill="#000000"/>
          <rect x="18" y="24" width="2" height="3" fill="#000000"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (tilted forward) -->
          <rect x="13" y="14" width="8" height="10" fill="#FFD700"/>
          <!-- Head -->
          <rect x="15" y="8" width="4" height="6" fill="#FFD700"/>
          <!-- Stripes -->
          <rect x="13" y="16" width="8" height="2" fill="#000000"/>
          <rect x="13" y="20" width="8" height="2" fill="#000000"/>
          <!-- Wings (active flying) -->
          <rect x="5" y="6" width="9" height="7" fill="#E0E0E0"/>
          <rect x="18" y="6" width="9" height="7" fill="#E0E0E0"/>
          <!-- Eyes -->
          <rect x="15" y="10" width="2" height="2" fill="#000000"/>
          <rect x="19" y="10" width="2" height="2" fill="#000000"/>
          <!-- Legs (walking) -->
          <rect x="14" y="24" width="2" height="3" fill="#000000"/>
          <rect x="16" y="24" width="2" height="3" fill="#000000"/>
        </svg>
      `)
    ],
    name: 'Buzzer'
  },
  '🐹': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="8" fill="#DEB887"/>
          <!-- Head -->
          <rect x="12" y="8" width="8" height="8" fill="#DEB887"/>
          <!-- Ears -->
          <rect x="12" y="6" width="3" height="3" fill="#DEB887"/>
          <rect x="17" y="6" width="3" height="3" fill="#DEB887"/>
          <!-- Eyes -->
          <rect x="13" y="11" width="2" height="2" fill="#000000"/>
          <rect x="17" y="11" width="2" height="2" fill="#000000"/>
          <!-- Nose -->
          <rect x="15" y="13" width="2" height="1" fill="#FF69B4"/>
          <!-- Arms -->
          <rect x="8" y="18" width="3" height="4" fill="#DEB887"/>
          <rect x="21" y="18" width="3" height="4" fill="#DEB887"/>
          <!-- Legs -->
          <rect x="12" y="24" width="3" height="4" fill="#DEB887"/>
          <rect x="17" y="24" width="3" height="4" fill="#DEB887"/>
          <!-- Tail -->
          <rect x="22" y="20" width="3" height="2" fill="#DEB887"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="8" fill="#DEB887"/>
          <!-- Head -->
          <rect x="12" y="7" width="8" height="8" fill="#DEB887"/>
          <!-- Ears -->
          <rect x="12" y="5" width="3" height="3" fill="#DEB887"/>
          <rect x="17" y="5" width="3" height="3" fill="#DEB887"/>
          <!-- Eyes -->
          <rect x="13" y="10" width="2" height="2" fill="#000000"/>
          <rect x="17" y="10" width="2" height="2" fill="#000000"/>
          <!-- Nose -->
          <rect x="15" y="12" width="2" height="1" fill="#FF69B4"/>
          <!-- Arms -->
          <rect x="8" y="17" width="3" height="4" fill="#DEB887"/>
          <rect x="21" y="17" width="3" height="4" fill="#DEB887"/>
          <!-- Legs -->
          <rect x="12" y="23" width="3" height="4" fill="#DEB887"/>
          <rect x="17" y="23" width="3" height="4" fill="#DEB887"/>
          <!-- Tail -->
          <rect x="22" y="19" width="3" height="2" fill="#DEB887"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#DEB887"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#DEB887"/>
          <!-- Ears -->
          <rect x="13" y="6" width="3" height="3" fill="#DEB887"/>
          <rect x="18" y="6" width="3" height="3" fill="#DEB887"/>
          <!-- Eyes -->
          <rect x="14" y="11" width="2" height="2" fill="#000000"/>
          <rect x="18" y="11" width="2" height="2" fill="#000000"/>
          <!-- Nose -->
          <rect x="16" y="13" width="2" height="1" fill="#FF69B4"/>
          <!-- Arms (swinging) -->
          <rect x="7" y="17" width="4" height="5" fill="#DEB887"/>
          <rect x="21" y="19" width="4" height="3" fill="#DEB887"/>
          <!-- Legs (walking) -->
          <rect x="11" y="24" width="3" height="4" fill="#DEB887"/>
          <rect x="19" y="24" width="3" height="4" fill="#DEB887"/>
          <!-- Tail -->
          <rect x="23" y="20" width="3" height="2" fill="#DEB887"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#DEB887"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#DEB887"/>
          <!-- Ears -->
          <rect x="13" y="6" width="3" height="3" fill="#DEB887"/>
          <rect x="18" y="6" width="3" height="3" fill="#DEB887"/>
          <!-- Eyes -->
          <rect x="14" y="11" width="2" height="2" fill="#000000"/>
          <rect x="18" y="11" width="2" height="2" fill="#000000"/>
          <!-- Nose -->
          <rect x="16" y="13" width="2" height="1" fill="#FF69B4"/>
          <!-- Arms (swinging) -->
          <rect x="9" y="19" width="4" height="3" fill="#DEB887"/>
          <rect x="23" y="17" width="4" height="5" fill="#DEB887"/>
          <!-- Legs (walking) -->
          <rect x="13" y="24" width="3" height="4" fill="#DEB887"/>
          <rect x="17" y="24" width="3" height="4" fill="#DEB887"/>
          <!-- Tail -->
          <rect x="23" y="20" width="3" height="2" fill="#DEB887"/>
        </svg>
      `)
    ],
    name: 'Nibbles'
  },
  '🐰': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="8" fill="#FFFFFF"/>
          <!-- Head -->
          <rect x="12" y="10" width="8" height="6" fill="#FFFFFF"/>
          <!-- Long ears -->
          <rect x="13" y="4" width="2" height="8" fill="#FFFFFF"/>
          <rect x="17" y="4" width="2" height="8" fill="#FFFFFF"/>
          <!-- Inner ears -->
          <rect x="13" y="6" width="2" height="4" fill="#FFB6C1"/>
          <rect x="17" y="6" width="2" height="4" fill="#FFB6C1"/>
          <!-- Eyes -->
          <rect x="13" y="12" width="2" height="2" fill="#000000"/>
          <rect x="17" y="12" width="2" height="2" fill="#000000"/>
          <!-- Nose -->
          <rect x="15" y="14" width="2" height="1" fill="#FF69B4"/>
          <!-- Arms -->
          <rect x="8" y="18" width="3" height="4" fill="#FFFFFF"/>
          <rect x="21" y="18" width="3" height="4" fill="#FFFFFF"/>
          <!-- Legs -->
          <rect x="12" y="24" width="3" height="4" fill="#FFFFFF"/>
          <rect x="17" y="24" width="3" height="4" fill="#FFFFFF"/>
          <!-- Fluffy tail -->
          <rect x="22" y="20" width="3" height="3" fill="#FFFFFF"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="8" fill="#FFFFFF"/>
          <!-- Head -->
          <rect x="12" y="9" width="8" height="6" fill="#FFFFFF"/>
          <!-- Long ears (slightly bouncing) -->
          <rect x="13" y="3" width="2" height="8" fill="#FFFFFF"/>
          <rect x="17" y="3" width="2" height="8" fill="#FFFFFF"/>
          <!-- Inner ears -->
          <rect x="13" y="5" width="2" height="4" fill="#FFB6C1"/>
          <rect x="17" y="5" width="2" height="4" fill="#FFB6C1"/>
          <!-- Eyes -->
          <rect x="13" y="11" width="2" height="2" fill="#000000"/>
          <rect x="17" y="11" width="2" height="2" fill="#000000"/>
          <!-- Nose -->
          <rect x="15" y="13" width="2" height="1" fill="#FF69B4"/>
          <!-- Arms -->
          <rect x="8" y="17" width="3" height="4" fill="#FFFFFF"/>
          <rect x="21" y="17" width="3" height="4" fill="#FFFFFF"/>
          <!-- Legs -->
          <rect x="12" y="23" width="3" height="4" fill="#FFFFFF"/>
          <rect x="17" y="23" width="3" height="4" fill="#FFFFFF"/>
          <!-- Fluffy tail -->
          <rect x="22" y="19" width="3" height="3" fill="#FFFFFF"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (hopping) -->
          <rect x="11" y="14" width="12" height="8" fill="#FFFFFF"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="6" fill="#FFFFFF"/>
          <!-- Long ears (bouncing) -->
          <rect x="14" y="2" width="2" height="8" fill="#FFFFFF"/>
          <rect x="18" y="2" width="2" height="8" fill="#FFFFFF"/>
          <!-- Inner ears -->
          <rect x="14" y="4" width="2" height="4" fill="#FFB6C1"/>
          <rect x="18" y="4" width="2" height="4" fill="#FFB6C1"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#000000"/>
          <rect x="18" y="10" width="2" height="2" fill="#000000"/>
          <!-- Nose -->
          <rect x="16" y="12" width="2" height="1" fill="#FF69B4"/>
          <!-- Arms (hopping motion) -->
          <rect x="7" y="16" width="4" height="4" fill="#FFFFFF"/>
          <rect x="21" y="16" width="4" height="4" fill="#FFFFFF"/>
          <!-- Legs (mid-hop) -->
          <rect x="10" y="22" width="4" height="4" fill="#FFFFFF"/>
          <rect x="18" y="22" width="4" height="4" fill="#FFFFFF"/>
          <!-- Fluffy tail -->
          <rect x="23" y="18" width="3" height="3" fill="#FFFFFF"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (landing) -->
          <rect x="11" y="16" width="12" height="8" fill="#FFFFFF"/>
          <!-- Head -->
          <rect x="13" y="10" width="8" height="6" fill="#FFFFFF"/>
          <!-- Long ears (settled) -->
          <rect x="14" y="4" width="2" height="8" fill="#FFFFFF"/>
          <rect x="18" y="4" width="2" height="8" fill="#FFFFFF"/>
          <!-- Inner ears -->
          <rect x="14" y="6" width="2" height="4" fill="#FFB6C1"/>
          <rect x="18" y="6" width="2" height="4" fill="#FFB6C1"/>
          <!-- Eyes -->
          <rect x="14" y="12" width="2" height="2" fill="#000000"/>
          <rect x="18" y="12" width="2" height="2" fill="#000000"/>
          <!-- Nose -->
          <rect x="16" y="14" width="2" height="1" fill="#FF69B4"/>
          <!-- Arms (landing) -->
          <rect x="9" y="18" width="3" height="4" fill="#FFFFFF"/>
          <rect x="22" y="18" width="3" height="4" fill="#FFFFFF"/>
          <!-- Legs (crouched after landing) -->
          <rect x="13" y="24" width="3" height="4" fill="#FFFFFF"/>
          <rect x="17" y="24" width="3" height="4" fill="#FFFFFF"/>
          <!-- Fluffy tail -->
          <rect x="22" y="20" width="3" height="3" fill="#FFFFFF"/>
        </svg>
      `)
    ],
    name: 'Hopper'
  },
  '🐱': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="8" fill="#FFA500"/>
          <!-- Head -->
          <rect x="12" y="10" width="8" height="6" fill="#FFA500"/>
          <!-- Ears -->
          <rect x="12" y="8" width="3" height="3" fill="#FFA500"/>
          <rect x="17" y="8" width="3" height="3" fill="#FFA500"/>
          <!-- Inner ears -->
          <rect x="13" y="9" width="1" height="1" fill="#FF69B4"/>
          <rect x="18" y="9" width="1" height="1" fill="#FF69B4"/>
          <!-- Eyes -->
          <rect x="13" y="12" width="2" height="2" fill="#32CD32"/>
          <rect x="17" y="12" width="2" height="2" fill="#32CD32"/>
          <!-- Nose -->
          <rect x="15" y="14" width="2" height="1" fill="#FF69B4"/>
          <!-- Mouth -->
          <rect x="14" y="15" width="4" height="1" fill="#000000"/>
          <!-- Arms -->
          <rect x="8" y="18" width="3" height="4" fill="#FFA500"/>
          <rect x="21" y="18" width="3" height="4" fill="#FFA500"/>
          <!-- Legs -->
          <rect x="12" y="24" width="3" height="4" fill="#FFA500"/>
          <rect x="17" y="24" width="3" height="4" fill="#FFA500"/>
          <!-- Tail -->
          <rect x="22" y="18" width="2" height="6" fill="#FFA500"/>
          <rect x="24" y="20" width="2" height="4" fill="#FFA500"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="8" fill="#FFA500"/>
          <!-- Head -->
          <rect x="12" y="9" width="8" height="6" fill="#FFA500"/>
          <!-- Ears -->
          <rect x="12" y="7" width="3" height="3" fill="#FFA500"/>
          <rect x="17" y="7" width="3" height="3" fill="#FFA500"/>
          <!-- Inner ears -->
          <rect x="13" y="8" width="1" height="1" fill="#FF69B4"/>
          <rect x="18" y="8" width="1" height="1" fill="#FF69B4"/>
          <!-- Eyes (blinking) -->
          <rect x="13" y="11" width="2" height="1" fill="#000000"/>
          <rect x="17" y="11" width="2" height="1" fill="#000000"/>
          <!-- Nose -->
          <rect x="15" y="13" width="2" height="1" fill="#FF69B4"/>
          <!-- Mouth -->
          <rect x="14" y="14" width="4" height="1" fill="#000000"/>
          <!-- Arms -->
          <rect x="8" y="17" width="3" height="4" fill="#FFA500"/>
          <rect x="21" y="17" width="3" height="4" fill="#FFA500"/>
          <!-- Legs -->
          <rect x="12" y="23" width="3" height="4" fill="#FFA500"/>
          <rect x="17" y="23" width="3" height="4" fill="#FFA500"/>
          <!-- Tail (swishing) -->
          <rect x="22" y="17" width="2" height="6" fill="#FFA500"/>
          <rect x="24" y="19" width="2" height="4" fill="#FFA500"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#FFA500"/>
          <!-- Head -->
          <rect x="13" y="10" width="8" height="6" fill="#FFA500"/>
          <!-- Ears -->
          <rect x="13" y="8" width="3" height="3" fill="#FFA500"/>
          <rect x="18" y="8" width="3" height="3" fill="#FFA500"/>
          <!-- Inner ears -->
          <rect x="14" y="9" width="1" height="1" fill="#FF69B4"/>
          <rect x="19" y="9" width="1" height="1" fill="#FF69B4"/>
          <!-- Eyes -->
          <rect x="14" y="12" width="2" height="2" fill="#32CD32"/>
          <rect x="18" y="12" width="2" height="2" fill="#32CD32"/>
          <!-- Nose -->
          <rect x="16" y="14" width="2" height="1" fill="#FF69B4"/>
          <!-- Mouth -->
          <rect x="15" y="15" width="4" height="1" fill="#000000"/>
          <!-- Arms (walking motion) -->
          <rect x="7" y="17" width="4" height="5" fill="#FFA500"/>
          <rect x="21" y="19" width="4" height="3" fill="#FFA500"/>
          <!-- Legs (walking) -->
          <rect x="11" y="24" width="3" height="4" fill="#FFA500"/>
          <rect x="18" y="24" width="3" height="4" fill="#FFA500"/>
          <!-- Tail (swishing while walking) -->
          <rect x="23" y="16" width="2" height="7" fill="#FFA500"/>
          <rect x="25" y="18" width="2" height="5" fill="#FFA500"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#FFA500"/>
          <!-- Head -->
          <rect x="13" y="10" width="8" height="6" fill="#FFA500"/>
          <!-- Ears -->
          <rect x="13" y="8" width="3" height="3" fill="#FFA500"/>
          <rect x="18" y="8" width="3" height="3" fill="#FFA500"/>
          <!-- Inner ears -->
          <rect x="14" y="9" width="1" height="1" fill="#FF69B4"/>
          <rect x="19" y="9" width="1" height="1" fill="#FF69B4"/>
          <!-- Eyes -->
          <rect x="14" y="12" width="2" height="2" fill="#32CD32"/>
          <rect x="18" y="12" width="2" height="2" fill="#32CD32"/>
          <!-- Nose -->
          <rect x="16" y="14" width="2" height="1" fill="#FF69B4"/>
          <!-- Mouth -->
          <rect x="15" y="15" width="4" height="1" fill="#000000"/>
          <!-- Arms (walking motion) -->
          <rect x="9" y="19" width="4" height="3" fill="#FFA500"/>
          <rect x="23" y="17" width="4" height="5" fill="#FFA500"/>
          <!-- Legs (walking) -->
          <rect x="13" y="24" width="3" height="4" fill="#FFA500"/>
          <rect x="16" y="24" width="3" height="4" fill="#FFA500"/>
          <!-- Tail (swishing opposite direction) -->
          <rect x="21" y="16" width="2" height="7" fill="#FFA500"/>
          <rect x="19" y="18" width="2" height="5" fill="#FFA500"/>
        </svg>
      `)
    ],
    name: 'Whiskers'
  },
  '🐢': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Shell -->
          <rect x="10" y="12" width="12" height="8" fill="#228B22"/>
          <rect x="12" y="14" width="8" height="4" fill="#32CD32"/>
          <!-- Shell pattern -->
          <rect x="14" y="15" width="2" height="2" fill="#006400"/>
          <rect x="16" y="15" width="2" height="2" fill="#006400"/>
          <!-- Head -->
          <rect x="12" y="8" width="8" height="4" fill="#90EE90"/>
          <!-- Eyes -->
          <rect x="14" y="9" width="2" height="2" fill="#000000"/>
          <rect x="16" y="9" width="2" height="2" fill="#000000"/>
          <!-- Legs -->
          <rect x="6" y="16" width="4" height="3" fill="#90EE90"/>
          <rect x="22" y="16" width="4" height="3" fill="#90EE90"/>
          <rect x="12" y="20" width="3" height="4" fill="#90EE90"/>
          <rect x="17" y="20" width="3" height="4" fill="#90EE90"/>
          <!-- Tail -->
          <rect x="14" y="24" width="4" height="2" fill="#90EE90"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Shell -->
          <rect x="10" y="13" width="12" height="8" fill="#228B22"/>
          <rect x="12" y="15" width="8" height="4" fill="#32CD32"/>
          <!-- Shell pattern -->
          <rect x="14" y="16" width="2" height="2" fill="#006400"/>
          <rect x="16" y="16" width="2" height="2" fill="#006400"/>
          <!-- Head (slightly retracted) -->
          <rect x="13" y="9" width="6" height="4" fill="#90EE90"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#000000"/>
          <rect x="16" y="10" width="2" height="2" fill="#000000"/>
          <!-- Legs -->
          <rect x="7" y="17" width="4" height="3" fill="#90EE90"/>
          <rect x="21" y="17" width="4" height="3" fill="#90EE90"/>
          <rect x="12" y="21" width="3" height="4" fill="#90EE90"/>
          <rect x="17" y="21" width="3" height="4" fill="#90EE90"/>
          <!-- Tail -->
          <rect x="14" y="25" width="4" height="2" fill="#90EE90"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Shell -->
          <rect x="11" y="12" width="12" height="8" fill="#228B22"/>
          <rect x="13" y="14" width="8" height="4" fill="#32CD32"/>
          <!-- Shell pattern -->
          <rect x="15" y="15" width="2" height="2" fill="#006400"/>
          <rect x="17" y="15" width="2" height="2" fill="#006400"/>
          <!-- Head (extended for walking) -->
          <rect x="11" y="8" width="10" height="4" fill="#90EE90"/>
          <!-- Eyes -->
          <rect x="13" y="9" width="2" height="2" fill="#000000"/>
          <rect x="17" y="9" width="2" height="2" fill="#000000"/>
          <!-- Legs (walking motion) -->
          <rect x="5" y="15" width="5" height="4" fill="#90EE90"/>
          <rect x="22" y="17" width="5" height="2" fill="#90EE90"/>
          <rect x="11" y="20" width="4" height="4" fill="#90EE90"/>
          <rect x="17" y="20" width="4" height="4" fill="#90EE90"/>
          <!-- Tail -->
          <rect x="15" y="24" width="4" height="2" fill="#90EE90"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Shell -->
          <rect x="11" y="12" width="12" height="8" fill="#228B22"/>
          <rect x="13" y="14" width="8" height="4" fill="#32CD32"/>
          <!-- Shell pattern -->
          <rect x="15" y="15" width="2" height="2" fill="#006400"/>
          <rect x="17" y="15" width="2" height="2" fill="#006400"/>
          <!-- Head (extended for walking) -->
          <rect x="11" y="8" width="10" height="4" fill="#90EE90"/>
          <!-- Eyes -->
          <rect x="13" y="9" width="2" height="2" fill="#000000"/>
          <rect x="17" y="9" width="2" height="2" fill="#000000"/>
          <!-- Legs (walking motion - opposite) -->
          <rect x="5" y="17" width="5" height="2" fill="#90EE90"/>
          <rect x="22" y="15" width="5" height="4" fill="#90EE90"/>
          <rect x="13" y="20" width="4" height="4" fill="#90EE90"/>
          <rect x="15" y="20" width="4" height="4" fill="#90EE90"/>
          <!-- Tail -->
          <rect x="15" y="24" width="4" height="2" fill="#90EE90"/>
        </svg>
      `)
    ],
    name: 'Shellington'
  },
  '🐸': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="8" fill="#32CD32"/>
          <!-- Head -->
          <rect x="12" y="10" width="8" height="6" fill="#32CD32"/>
          <!-- Eye bulges -->
          <rect x="11" y="8" width="4" height="4" fill="#32CD32"/>
          <rect x="17" y="8" width="4" height="4" fill="#32CD32"/>
          <!-- Eyes -->
          <rect x="12" y="9" width="2" height="2" fill="#000000"/>
          <rect x="18" y="9" width="2" height="2" fill="#000000"/>
          <!-- Mouth -->
          <rect x="14" y="14" width="4" height="1" fill="#000000"/>
          <!-- Arms -->
          <rect x="8" y="18" width="3" height="4" fill="#32CD32"/>
          <rect x="21" y="18" width="3" height="4" fill="#32CD32"/>
          <!-- Legs (crouched) -->
          <rect x="12" y="24" width="3" height="4" fill="#32CD32"/>
          <rect x="17" y="24" width="3" height="4" fill="#32CD32"/>
          <!-- Belly -->
          <rect x="13" y="18" width="6" height="4" fill="#90EE90"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="8" fill="#32CD32"/>
          <!-- Head -->
          <rect x="12" y="9" width="8" height="6" fill="#32CD32"/>
          <!-- Eye bulges -->
          <rect x="11" y="7" width="4" height="4" fill="#32CD32"/>
          <rect x="17" y="7" width="4" height="4" fill="#32CD32"/>
          <!-- Eyes (blinking) -->
          <rect x="12" y="8" width="2" height="1" fill="#000000"/>
          <rect x="18" y="8" width="2" height="1" fill="#000000"/>
          <!-- Mouth -->
          <rect x="14" y="13" width="4" height="1" fill="#000000"/>
          <!-- Arms -->
          <rect x="8" y="17" width="3" height="4" fill="#32CD32"/>
          <rect x="21" y="17" width="3" height="4" fill="#32CD32"/>
          <!-- Legs (crouched) -->
          <rect x="12" y="23" width="3" height="4" fill="#32CD32"/>
          <rect x="17" y="23" width="3" height="4" fill="#32CD32"/>
          <!-- Belly -->
          <rect x="13" y="17" width="6" height="4" fill="#90EE90"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (mid-hop) -->
          <rect x="11" y="14" width="12" height="8" fill="#32CD32"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="6" fill="#32CD32"/>
          <!-- Eye bulges -->
          <rect x="12" y="6" width="4" height="4" fill="#32CD32"/>
          <rect x="18" y="6" width="4" height="4" fill="#32CD32"/>
          <!-- Eyes -->
          <rect x="13" y="7" width="2" height="2" fill="#000000"/>
          <rect x="19" y="7" width="2" height="2" fill="#000000"/>
          <!-- Mouth -->
          <rect x="15" y="12" width="4" height="1" fill="#000000"/>
          <!-- Arms (extended) -->
          <rect x="7" y="16" width="4" height="4" fill="#32CD32"/>
          <rect x="21" y="16" width="4" height="4" fill="#32CD32"/>
          <!-- Legs (extended for hop) -->
          <rect x="10" y="22" width="4" height="5" fill="#32CD32"/>
          <rect x="18" y="22" width="4" height="5" fill="#32CD32"/>
          <!-- Belly -->
          <rect x="14" y="16" width="6" height="4" fill="#90EE90"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (landing) -->
          <rect x="11" y="16" width="12" height="8" fill="#32CD32"/>
          <!-- Head -->
          <rect x="13" y="10" width="8" height="6" fill="#32CD32"/>
          <!-- Eye bulges -->
          <rect x="12" y="8" width="4" height="4" fill="#32CD32"/>
          <rect x="18" y="8" width="4" height="4" fill="#32CD32"/>
          <!-- Eyes -->
          <rect x="13" y="9" width="2" height="2" fill="#000000"/>
          <rect x="19" y="9" width="2" height="2" fill="#000000"/>
          <!-- Mouth -->
          <rect x="15" y="14" width="4" height="1" fill="#000000"/>
          <!-- Arms (tucked) -->
          <rect x="9" y="18" width="3" height="4" fill="#32CD32"/>
          <rect x="22" y="18" width="3" height="4" fill="#32CD32"/>
          <!-- Legs (crouched after landing) -->
          <rect x="13" y="24" width="3" height="4" fill="#32CD32"/>
          <rect x="16" y="24" width="3" height="4" fill="#32CD32"/>
          <!-- Belly -->
          <rect x="14" y="18" width="6" height="4" fill="#90EE90"/>
        </svg>
      `)
    ],
    name: 'Ribbit'
  },
  '🐲': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="8" fill="#4169E1"/>
          <!-- Head -->
          <rect x="12" y="8" width="8" height="8" fill="#4169E1"/>
          <!-- Snout -->
          <rect x="8" y="12" width="4" height="4" fill="#4169E1"/>
          <!-- Eyes -->
          <rect x="13" y="10" width="2" height="2" fill="#FF0000"/>
          <rect x="17" y="10" width="2" height="2" fill="#FF0000"/>
          <!-- Nostrils -->
          <rect x="9" y="13" width="1" height="1" fill="#000000"/>
          <rect x="10" y="13" width="1" height="1" fill="#000000"/>
          <!-- Wings -->
          <rect x="6" y="14" width="6" height="8" fill="#191970"/>
          <rect x="20" y="14" width="6" height="8" fill="#191970"/>
          <!-- Wing details -->
          <rect x="7" y="16" width="4" height="4" fill="#4169E1"/>
          <rect x="21" y="16" width="4" height="4" fill="#4169E1"/>
          <!-- Legs -->
          <rect x="12" y="24" width="3" height="4" fill="#4169E1"/>
          <rect x="17" y="24" width="3" height="4" fill="#4169E1"/>
          <!-- Tail -->
          <rect x="22" y="20" width="4" height="2" fill="#4169E1"/>
          <rect x="24" y="18" width="2" height="2" fill="#4169E1"/>
          <!-- Spikes on back -->
          <rect x="14" y="14" width="2" height="2" fill="#FF4500"/>
          <rect x="16" y="14" width="2" height="2" fill="#FF4500"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="8" fill="#4169E1"/>
          <!-- Head -->
          <rect x="12" y="7" width="8" height="8" fill="#4169E1"/>
          <!-- Snout -->
          <rect x="8" y="11" width="4" height="4" fill="#4169E1"/>
          <!-- Eyes -->
          <rect x="13" y="9" width="2" height="2" fill="#FF0000"/>
          <rect x="17" y="9" width="2" height="2" fill="#FF0000"/>
          <!-- Nostrils -->
          <rect x="9" y="12" width="1" height="1" fill="#000000"/>
          <rect x="10" y="12" width="1" height="1" fill="#000000"/>
          <!-- Wings (slight flap) -->
          <rect x="5" y="12" width="7" height="9" fill="#191970"/>
          <rect x="20" y="12" width="7" height="9" fill="#191970"/>
          <!-- Wing details -->
          <rect x="6" y="14" width="5" height="5" fill="#4169E1"/>
          <rect x="21" y="14" width="5" height="5" fill="#4169E1"/>
          <!-- Legs -->
          <rect x="12" y="23" width="3" height="4" fill="#4169E1"/>
          <rect x="17" y="23" width="3" height="4" fill="#4169E1"/>
          <!-- Tail -->
          <rect x="22" y="19" width="4" height="2" fill="#4169E1"/>
          <rect x="24" y="17" width="2" height="2" fill="#4169E1"/>
          <!-- Spikes on back -->
          <rect x="14" y="13" width="2" height="2" fill="#FF4500"/>
          <rect x="16" y="13" width="2" height="2" fill="#FF4500"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#4169E1"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#4169E1"/>
          <!-- Snout -->
          <rect x="9" y="12" width="4" height="4" fill="#4169E1"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#FF0000"/>
          <rect x="18" y="10" width="2" height="2" fill="#FF0000"/>
          <!-- Nostrils with fire breath -->
          <rect x="6" y="13" width="3" height="1" fill="#FF4500"/>
          <rect x="5" y="14" width="2" height="1" fill="#FFFF00"/>
          <!-- Wings (extended) -->
          <rect x="3" y="10" width="9" height="10" fill="#191970"/>
          <rect x="20" y="10" width="9" height="10" fill="#191970"/>
          <!-- Wing details -->
          <rect x="4" y="12" width="7" height="6" fill="#4169E1"/>
          <rect x="21" y="12" width="7" height="6" fill="#4169E1"/>
          <!-- Legs (walking) -->
          <rect x="11" y="24" width="3" height="4" fill="#4169E1"/>
          <rect x="18" y="24" width="3" height="4" fill="#4169E1"/>
          <!-- Tail -->
          <rect x="23" y="20" width="4" height="2" fill="#4169E1"/>
          <rect x="25" y="18" width="2" height="2" fill="#4169E1"/>
          <!-- Spikes on back -->
          <rect x="15" y="14" width="2" height="2" fill="#FF4500"/>
          <rect x="17" y="14" width="2" height="2" fill="#FF4500"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#4169E1"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#4169E1"/>
          <!-- Snout -->
          <rect x="9" y="12" width="4" height="4" fill="#4169E1"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#FF0000"/>
          <rect x="18" y="10" width="2" height="2" fill="#FF0000"/>
          <!-- Nostrils -->
          <rect x="10" y="13" width="1" height="1" fill="#000000"/>
          <rect x="11" y="13" width="1" height="1" fill="#000000"/>
          <!-- Wings (folded back) -->
          <rect x="4" y="12" width="8" height="9" fill="#191970"/>
          <rect x="20" y="12" width="8" height="9" fill="#191970"/>
          <!-- Wing details -->
          <rect x="5" y="14" width="6" height="5" fill="#4169E1"/>
          <rect x="21" y="14" width="6" height="5" fill="#4169E1"/>
          <!-- Legs (walking) -->
          <rect x="13" y="24" width="3" height="4" fill="#4169E1"/>
          <rect x="16" y="24" width="3" height="4" fill="#4169E1"/>
          <!-- Tail -->
          <rect x="23" y="20" width="4" height="2" fill="#4169E1"/>
          <rect x="25" y="18" width="2" height="2" fill="#4169E1"/>
          <!-- Spikes on back -->
          <rect x="15" y="14" width="2" height="2" fill="#FF4500"/>
          <rect x="17" y="14" width="2" height="2" fill="#FF4500"/>
        </svg>
      `)
    ],
    name: 'Draco'
  },
  '🦅': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="12" y="16" width="8" height="8" fill="#8B4513"/>
          <!-- Head -->
          <rect x="14" y="8" width="4" height="8" fill="#FFFFFF"/>
          <!-- Beak -->
          <rect x="12" y="12" width="2" height="2" fill="#FFD700"/>
          <!-- Eyes -->
          <rect x="15" y="10" width="2" height="2" fill="#000000"/>
          <!-- Wings (spread) -->
          <rect x="4" y="14" width="8" height="6" fill="#8B4513"/>
          <rect x="20" y="14" width="8" height="6" fill="#8B4513"/>
          <!-- Wing tips -->
          <rect x="2" y="16" width="4" height="4" fill="#654321"/>
          <rect x="26" y="16" width="4" height="4" fill="#654321"/>
          <!-- Tail feathers -->
          <rect x="16" y="24" width="2" height="4" fill="#8B4513"/>
          <rect x="14" y="26" width="2" height="2" fill="#8B4513"/>
          <rect x="18" y="26" width="2" height="2" fill="#8B4513"/>
          <!-- Legs -->
          <rect x="14" y="24" width="2" height="3" fill="#FFD700"/>
          <rect x="16" y="24" width="2" height="3" fill="#FFD700"/>
          <!-- Talons -->
          <rect x="13" y="27" width="3" height="1" fill="#FFD700"/>
          <rect x="16" y="27" width="3" height="1" fill="#FFD700"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="12" y="15" width="8" height="8" fill="#8B4513"/>
          <!-- Head -->
          <rect x="14" y="7" width="4" height="8" fill="#FFFFFF"/>
          <!-- Beak -->
          <rect x="12" y="11" width="2" height="2" fill="#FFD700"/>
          <!-- Eyes -->
          <rect x="15" y="9" width="2" height="2" fill="#000000"/>
          <!-- Wings (flapping up) -->
          <rect x="3" y="10" width="9" height="8" fill="#8B4513"/>
          <rect x="20" y="10" width="9" height="8" fill="#8B4513"/>
          <!-- Wing tips -->
          <rect x="1" y="12" width="5" height="6" fill="#654321"/>
          <rect x="26" y="12" width="5" height="6" fill="#654321"/>
          <!-- Tail feathers -->
          <rect x="16" y="23" width="2" height="4" fill="#8B4513"/>
          <rect x="14" y="25" width="2" height="2" fill="#8B4513"/>
          <rect x="18" y="25" width="2" height="2" fill="#8B4513"/>
          <!-- Legs -->
          <rect x="14" y="23" width="2" height="3" fill="#FFD700"/>
          <rect x="16" y="23" width="2" height="3" fill="#FFD700"/>
          <!-- Talons -->
          <rect x="13" y="26" width="3" height="1" fill="#FFD700"/>
          <rect x="16" y="26" width="3" height="1" fill="#FFD700"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (soaring) -->
          <rect x="13" y="14" width="8" height="8" fill="#8B4513"/>
          <!-- Head -->
          <rect x="15" y="6" width="4" height="8" fill="#FFFFFF"/>
          <!-- Beak -->
          <rect x="13" y="10" width="2" height="2" fill="#FFD700"/>
          <!-- Eyes -->
          <rect x="16" y="8" width="2" height="2" fill="#000000"/>
          <!-- Wings (full spread gliding) -->
          <rect x="1" y="8" width="12" height="10" fill="#8B4513"/>
          <rect x="19" y="8" width="12" height="10" fill="#8B4513"/>
          <!-- Wing details -->
          <rect x="2" y="10" width="10" height="6" fill="#654321"/>
          <rect x="20" y="10" width="10" height="6" fill="#654321"/>
          <!-- Wing tips -->
          <rect x="0" y="12" width="4" height="4" fill="#A0522D"/>
          <rect x="28" y="12" width="4" height="4" fill="#A0522D"/>
          <!-- Tail feathers (spread) -->
          <rect x="17" y="22" width="2" height="4" fill="#8B4513"/>
          <rect x="15" y="24" width="2" height="3" fill="#8B4513"/>
          <rect x="19" y="24" width="2" height="3" fill="#8B4513"/>
          <!-- Legs (tucked) -->
          <rect x="15" y="22" width="2" height="2" fill="#FFD700"/>
          <rect x="17" y="22" width="2" height="2" fill="#FFD700"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="13" y="16" width="8" height="8" fill="#8B4513"/>
          <!-- Head -->
          <rect x="15" y="8" width="4" height="8" fill="#FFFFFF"/>
          <!-- Beak -->
          <rect x="13" y="12" width="2" height="2" fill="#FFD700"/>
          <!-- Eyes -->
          <rect x="16" y="10" width="2" height="2" fill="#000000"/>
          <!-- Wings (landing position) -->
          <rect x="5" y="12" width="8" height="8" fill="#8B4513"/>
          <rect x="19" y="12" width="8" height="8" fill="#8B4513"/>
          <!-- Wing tips -->
          <rect x="3" y="14" width="4" height="6" fill="#654321"/>
          <rect x="25" y="14" width="4" height="6" fill="#654321"/>
          <!-- Tail feathers -->
          <rect x="17" y="24" width="2" height="4" fill="#8B4513"/>
          <rect x="15" y="26" width="2" height="2" fill="#8B4513"/>
          <rect x="19" y="26" width="2" height="2" fill="#8B4513"/>
          <!-- Legs (landing) -->
          <rect x="14" y="24" width="2" height="4" fill="#FFD700"/>
          <rect x="16" y="24" width="2" height="4" fill="#FFD700"/>
          <!-- Talons -->
          <rect x="13" y="28" width="3" height="1" fill="#FFD700"/>
          <rect x="16" y="28" width="3" height="1" fill="#FFD700"/>
        </svg>
      `)
    ],
    name: 'Skyfall'
  },
  '🐺': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="8" fill="#696969"/>
          <!-- Head -->
          <rect x="12" y="8" width="8" height="8" fill="#696969"/>
          <!-- Snout -->
          <rect x="8" y="12" width="4" height="4" fill="#696969"/>
          <!-- Ears -->
          <rect x="12" y="6" width="3" height="3" fill="#696969"/>
          <rect x="17" y="6" width="3" height="3" fill="#696969"/>
          <!-- Inner ears -->
          <rect x="13" y="7" width="1" height="1" fill="#FF69B4"/>
          <rect x="18" y="7" width="1" height="1" fill="#FF69B4"/>
          <!-- Eyes -->
          <rect x="13" y="10" width="2" height="2" fill="#FFFF00"/>
          <rect x="17" y="10" width="2" height="2" fill="#FFFF00"/>
          <!-- Nose -->
          <rect x="9" y="13" width="2" height="2" fill="#000000"/>
          <!-- Mouth -->
          <rect x="10" y="15" width="3" height="1" fill="#000000"/>
          <!-- Arms -->
          <rect x="8" y="18" width="3" height="4" fill="#696969"/>
          <rect x="21" y="18" width="3" height="4" fill="#696969"/>
          <!-- Legs -->
          <rect x="12" y="24" width="3" height="4" fill="#696969"/>
          <rect x="17" y="24" width="3" height="4" fill="#696969"/>
          <!-- Tail -->
          <rect x="22" y="18" width="2" height="6" fill="#696969"/>
          <rect x="24" y="20" width="2" height="4" fill="#696969"/>
          <!-- Belly -->
          <rect x="13" y="18" width="6" height="4" fill="#D3D3D3"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="8" fill="#696969"/>
          <!-- Head -->
          <rect x="12" y="7" width="8" height="8" fill="#696969"/>
          <!-- Snout -->
          <rect x="8" y="11" width="4" height="4" fill="#696969"/>
          <!-- Ears -->
          <rect x="12" y="5" width="3" height="3" fill="#696969"/>
          <rect x="17" y="5" width="3" height="3" fill="#696969"/>
          <!-- Inner ears -->
          <rect x="13" y="6" width="1" height="1" fill="#FF69B4"/>
          <rect x="18" y="6" width="1" height="1" fill="#FF69B4"/>
          <!-- Eyes (alert) -->
          <rect x="13" y="9" width="2" height="2" fill="#FFFF00"/>
          <rect x="17" y="9" width="2" height="2" fill="#FFFF00"/>
          <!-- Nose -->
          <rect x="9" y="12" width="2" height="2" fill="#000000"/>
          <!-- Mouth -->
          <rect x="10" y="14" width="3" height="1" fill="#000000"/>
          <!-- Arms -->
          <rect x="8" y="17" width="3" height="4" fill="#696969"/>
          <rect x="21" y="17" width="3" height="4" fill="#696969"/>
          <!-- Legs -->
          <rect x="12" y="23" width="3" height="4" fill="#696969"/>
          <rect x="17" y="23" width="3" height="4" fill="#696969"/>
          <!-- Tail (alert position) -->
          <rect x="22" y="16" width="2" height="7" fill="#696969"/>
          <rect x="24" y="18" width="2" height="5" fill="#696969"/>
          <!-- Belly -->
          <rect x="13" y="17" width="6" height="4" fill="#D3D3D3"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#696969"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#696969"/>
          <!-- Snout -->
          <rect x="9" y="12" width="4" height="4" fill="#696969"/>
          <!-- Ears -->
          <rect x="13" y="6" width="3" height="3" fill="#696969"/>
          <rect x="18" y="6" width="3" height="3" fill="#696969"/>
          <!-- Inner ears -->
          <rect x="14" y="7" width="1" height="1" fill="#FF69B4"/>
          <rect x="19" y="7" width="1" height="1" fill="#FF69B4"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#FFFF00"/>
          <rect x="18" y="10" width="2" height="2" fill="#FFFF00"/>
          <!-- Nose -->
          <rect x="10" y="13" width="2" height="2" fill="#000000"/>
          <!-- Mouth -->
          <rect x="11" y="15" width="3" height="1" fill="#000000"/>
          <!-- Arms (running motion) -->
          <rect x="7" y="17" width="4" height="5" fill="#696969"/>
          <rect x="21" y="19" width="4" height="3" fill="#696969"/>
          <!-- Legs (running) -->
          <rect x="11" y="24" width="3" height="4" fill="#696969"/>
          <rect x="18" y="24" width="3" height="4" fill="#696969"/>
          <!-- Tail (running) -->
          <rect x="23" y="17" width="2" height="7" fill="#696969"/>
          <rect x="25" y="19" width="2" height="5" fill="#696969"/>
          <!-- Belly -->
          <rect x="14" y="18" width="6" height="4" fill="#D3D3D3"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#696969"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#696969"/>
          <!-- Snout -->
          <rect x="9" y="12" width="4" height="4" fill="#696969"/>
          <!-- Ears -->
          <rect x="13" y="6" width="3" height="3" fill="#696969"/>
          <rect x="18" y="6" width="3" height="3" fill="#696969"/>
          <!-- Inner ears -->
          <rect x="14" y="7" width="1" height="1" fill="#FF69B4"/>
          <rect x="19" y="7" width="1" height="1" fill="#FF69B4"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#FFFF00"/>
          <rect x="18" y="10" width="2" height="2" fill="#FFFF00"/>
          <!-- Nose -->
          <rect x="10" y="13" width="2" height="2" fill="#000000"/>
          <!-- Mouth -->
          <rect x="11" y="15" width="3" height="1" fill="#000000"/>
          <!-- Arms (running motion) -->
          <rect x="9" y="19" width="4" height="3" fill="#696969"/>
          <rect x="23" y="17" width="4" height="5" fill="#696969"/>
          <!-- Legs (running) -->
          <rect x="13" y="24" width="3" height="4" fill="#696969"/>
          <rect x="16" y="24" width="3" height="4" fill="#696969"/>
          <!-- Tail (running) -->
          <rect x="21" y="17" width="2" height="7" fill="#696969"/>
          <rect x="19" y="19" width="2" height="5" fill="#696969"/>
          <!-- Belly -->
          <rect x="14" y="18" width="6" height="4" fill="#D3D3D3"/>
        </svg>
      `)
    ],
    name: 'Fenrir'
  },
  '🦊': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="8" fill="#FF8C00"/>
          <!-- Head -->
          <rect x="12" y="8" width="8" height="8" fill="#FF8C00"/>
          <!-- Snout -->
          <rect x="8" y="12" width="4" height="4" fill="#FF8C00"/>
          <!-- Ears (pointed) -->
          <rect x="12" y="6" width="3" height="3" fill="#FF8C00"/>
          <rect x="17" y="6" width="3" height="3" fill="#FF8C00"/>
          <!-- Ear tips -->
          <rect x="13" y="5" width="1" height="1" fill="#000000"/>
          <rect x="18" y="5" width="1" height="1" fill="#000000"/>
          <!-- Inner ears -->
          <rect x="13" y="7" width="1" height="1" fill="#FFFFFF"/>
          <rect x="18" y="7" width="1" height="1" fill="#FFFFFF"/>
          <!-- Eyes -->
          <rect x="13" y="10" width="2" height="2" fill="#000000"/>
          <rect x="17" y="10" width="2" height="2" fill="#000000"/>
          <!-- Nose -->
          <rect x="9" y="13" width="2" height="2" fill="#000000"/>
          <!-- Mouth -->
          <rect x="10" y="15" width="3" height="1" fill="#000000"/>
          <!-- Arms -->
          <rect x="8" y="18" width="3" height="4" fill="#FF8C00"/>
          <rect x="21" y="18" width="3" height="4" fill="#FF8C00"/>
          <!-- Legs -->
          <rect x="12" y="24" width="3" height="4" fill="#FF8C00"/>
          <rect x="17" y="24" width="3" height="4" fill="#FF8C00"/>
          <!-- Fluffy tail -->
          <rect x="22" y="16" width="3" height="8" fill="#FF8C00"/>
          <rect x="25" y="18" width="2" height="6" fill="#FFFFFF"/>
          <!-- Belly -->
          <rect x="13" y="18" width="6" height="4" fill="#FFFFFF"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="8" fill="#FF8C00"/>
          <!-- Head -->
          <rect x="12" y="7" width="8" height="8" fill="#FF8C00"/>
          <!-- Snout -->
          <rect x="8" y="11" width="4" height="4" fill="#FF8C00"/>
          <!-- Ears (pointed) -->
          <rect x="12" y="5" width="3" height="3" fill="#FF8C00"/>
          <rect x="17" y="5" width="3" height="3" fill="#FF8C00"/>
          <!-- Ear tips -->
          <rect x="13" y="4" width="1" height="1" fill="#000000"/>
          <rect x="18" y="4" width="1" height="1" fill="#000000"/>
          <!-- Inner ears -->
          <rect x="13" y="6" width="1" height="1" fill="#FFFFFF"/>
          <rect x="18" y="6" width="1" height="1" fill="#FFFFFF"/>
          <!-- Eyes (sly look) -->
          <rect x="13" y="9" width="2" height="1" fill="#000000"/>
          <rect x="17" y="9" width="2" height="1" fill="#000000"/>
          <!-- Nose -->
          <rect x="9" y="12" width="2" height="2" fill="#000000"/>
          <!-- Mouth -->
          <rect x="10" y="14" width="3" height="1" fill="#000000"/>
          <!-- Arms -->
          <rect x="8" y="17" width="3" height="4" fill="#FF8C00"/>
          <rect x="21" y="17" width="3" height="4" fill="#FF8C00"/>
          <!-- Legs -->
          <rect x="12" y="23" width="3" height="4" fill="#FF8C00"/>
          <rect x="17" y="23" width="3" height="4" fill="#FF8C00"/>
          <!-- Fluffy tail (swishing) -->
          <rect x="22" y="15" width="3" height="8" fill="#FF8C00"/>
          <rect x="25" y="17" width="2" height="6" fill="#FFFFFF"/>
          <!-- Belly -->
          <rect x="13" y="17" width="6" height="4" fill="#FFFFFF"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#FF8C00"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#FF8C00"/>
          <!-- Snout -->
          <rect x="9" y="12" width="4" height="4" fill="#FF8C00"/>
          <!-- Ears (pointed) -->
          <rect x="13" y="6" width="3" height="3" fill="#FF8C00"/>
          <rect x="18" y="6" width="3" height="3" fill="#FF8C00"/>
          <!-- Ear tips -->
          <rect x="14" y="5" width="1" height="1" fill="#000000"/>
          <rect x="19" y="5" width="1" height="1" fill="#000000"/>
          <!-- Inner ears -->
          <rect x="14" y="7" width="1" height="1" fill="#FFFFFF"/>
          <rect x="19" y="7" width="1" height="1" fill="#FFFFFF"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#000000"/>
          <rect x="18" y="10" width="2" height="2" fill="#000000"/>
          <!-- Nose -->
          <rect x="10" y="13" width="2" height="2" fill="#000000"/>
          <!-- Mouth -->
          <rect x="11" y="15" width="3" height="1" fill="#000000"/>
          <!-- Arms (trotting) -->
          <rect x="7" y="17" width="4" height="5" fill="#FF8C00"/>
          <rect x="21" y="19" width="4" height="3" fill="#FF8C00"/>
          <!-- Legs (trotting) -->
          <rect x="11" y="24" width="3" height="4" fill="#FF8C00"/>
          <rect x="18" y="24" width="3" height="4" fill="#FF8C00"/>
          <!-- Fluffy tail (bouncing) -->
          <rect x="23" y="14" width="3" height="10" fill="#FF8C00"/>
          <rect x="26" y="16" width="2" height="8" fill="#FFFFFF"/>
          <!-- Belly -->
          <rect x="14" y="18" width="6" height="4" fill="#FFFFFF"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#FF8C00"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#FF8C00"/>
          <!-- Snout -->
          <rect x="9" y="12" width="4" height="4" fill="#FF8C00"/>
          <!-- Ears (pointed) -->
          <rect x="13" y="6" width="3" height="3" fill="#FF8C00"/>
          <rect x="18" y="6" width="3" height="3" fill="#FF8C00"/>
          <!-- Ear tips -->
          <rect x="14" y="5" width="1" height="1" fill="#000000"/>
          <rect x="19" y="5" width="1" height="1" fill="#000000"/>
          <!-- Inner ears -->
          <rect x="14" y="7" width="1" height="1" fill="#FFFFFF"/>
          <rect x="19" y="7" width="1" height="1" fill="#FFFFFF"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#000000"/>
          <rect x="18" y="10" width="2" height="2" fill="#000000"/>
          <!-- Nose -->
          <rect x="10" y="13" width="2" height="2" fill="#000000"/>
          <!-- Mouth -->
          <rect x="11" y="15" width="3" height="1" fill="#000000"/>
          <!-- Arms (trotting) -->
          <rect x="9" y="19" width="4" height="3" fill="#FF8C00"/>
          <rect x="23" y="17" width="4" height="5" fill="#FF8C00"/>
          <!-- Legs (trotting) -->
          <rect x="13" y="24" width="3" height="4" fill="#FF8C00"/>
          <rect x="16" y="24" width="3" height="4" fill="#FF8C00"/>
          <!-- Fluffy tail (bouncing) -->
          <rect x="21" y="14" width="3" height="10" fill="#FF8C00"/>
          <rect x="19" y="16" width="2" height="8" fill="#FFFFFF"/>
          <!-- Belly -->
          <rect x="14" y="18" width="6" height="4" fill="#FFFFFF"/>
        </svg>
      `)
    ],
    name: 'Vixen'
  },
  // Eternal Phoenix - Mythical pet with ethereal flames
  '⭐': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (ethereal white-gold) -->
          <rect x="10" y="16" width="12" height="10" fill="#F0F8FF"/>
          <!-- Head -->
          <rect x="12" y="8" width="8" height="8" fill="#F0F8FF"/>
          <!-- Eternal flame crest (white-blue flames) -->
          <rect x="14" y="4" width="2" height="4" fill="#E6E6FA"/>
          <rect x="16" y="4" width="2" height="4" fill="#F0F8FF"/>
          <rect x="13" y="2" width="1" height="2" fill="#FFFFFF"/>
          <rect x="17" y="2" width="1" height="2" fill="#FFFFFF"/>
          <rect x="15" y="1" width="2" height="1" fill="#87CEEB"/>
          <!-- Beak (silvery) -->
          <rect x="14" y="12" width="4" height="2" fill="#C0C0C0"/>
          <!-- Eyes (ethereal blue) -->
          <rect x="13" y="10" width="2" height="2" fill="#87CEEB"/>
          <rect x="17" y="10" width="2" height="2" fill="#87CEEB"/>
          <rect x="13" y="10" width="1" height="1" fill="#FFFFFF"/>
          <rect x="17" y="10" width="1" height="1" fill="#FFFFFF"/>
          <!-- Wings (ethereal with starlight effect) -->
          <rect x="8" y="18" width="4" height="6" fill="#F0F8FF"/>
          <rect x="20" y="18" width="4" height="6" fill="#F0F8FF"/>
          <rect x="6" y="19" width="2" height="4" fill="#E6E6FA"/>
          <rect x="24" y="19" width="2" height="4" fill="#E6E6FA"/>
          <rect x="5" y="20" width="1" height="2" fill="#87CEEB"/>
          <rect x="26" y="20" width="1" height="2" fill="#87CEEB"/>
          <!-- Feet -->
          <rect x="12" y="26" width="3" height="3" fill="#C0C0C0"/>
          <rect x="17" y="26" width="3" height="3" fill="#C0C0C0"/>
          <!-- Eternal aura (starlight) -->
          <rect x="8" y="14" width="1" height="1" fill="#FFFFFF"/>
          <rect x="23" y="15" width="1" height="1" fill="#87CEEB"/>
          <rect x="6" y="17" width="1" height="1" fill="#E6E6FA"/>
          <rect x="25" y="18" width="1" height="1" fill="#FFFFFF"/>
          <!-- Star effects -->
          <rect x="9" y="12" width="1" height="1" fill="#FFFFFF"/>
          <rect x="22" y="13" width="1" height="1" fill="#87CEEB"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="10" fill="#F0F8FF"/>
          <!-- Head -->
          <rect x="12" y="7" width="8" height="8" fill="#F0F8FF"/>
          <!-- Eternal flame crest (pulsing) -->
          <rect x="14" y="3" width="2" height="4" fill="#E6E6FA"/>
          <rect x="16" y="3" width="2" height="4" fill="#F0F8FF"/>
          <rect x="13" y="1" width="1" height="2" fill="#FFFFFF"/>
          <rect x="17" y="1" width="1" height="2" fill="#FFFFFF"/>
          <rect x="15" y="2" width="2" height="1" fill="#87CEEB"/>
          <!-- Beak -->
          <rect x="14" y="11" width="4" height="2" fill="#C0C0C0"/>
          <!-- Eyes (glowing eternal) -->
          <rect x="13" y="9" width="2" height="2" fill="#87CEEB"/>
          <rect x="17" y="9" width="2" height="2" fill="#87CEEB"/>
          <rect x="14" y="9" width="1" height="1" fill="#FFFFFF"/>
          <rect x="18" y="9" width="1" height="1" fill="#FFFFFF"/>
          <!-- Wings (intense ethereal glow) -->
          <rect x="7" y="17" width="5" height="7" fill="#F0F8FF"/>
          <rect x="20" y="17" width="5" height="7" fill="#F0F8FF"/>
          <rect x="5" y="18" width="3" height="5" fill="#E6E6FA"/>
          <rect x="24" y="18" width="3" height="5" fill="#E6E6FA"/>
          <rect x="4" y="19" width="2" height="3" fill="#87CEEB"/>
          <rect x="26" y="19" width="2" height="3" fill="#87CEEB"/>
          <!-- Feet -->
          <rect x="12" y="25" width="3" height="3" fill="#C0C0C0"/>
          <rect x="17" y="25" width="3" height="3" fill="#C0C0C0"/>
          <!-- Enhanced eternal aura -->
          <rect x="7" y="13" width="1" height="1" fill="#FFFFFF"/>
          <rect x="24" y="14" width="1" height="1" fill="#87CEEB"/>
          <rect x="5" y="16" width="1" height="1" fill="#E6E6FA"/>
          <rect x="26" y="17" width="1" height="1" fill="#FFFFFF"/>
          <rect x="9" y="12" width="1" height="1" fill="#87CEEB"/>
          <rect x="22" y="13" width="1" height="1" fill="#FFFFFF"/>
          <!-- Starlight sparkles -->
          <rect x="11" y="11" width="1" height="1" fill="#FFFFFF"/>
          <rect x="20" y="12" width="1" height="1" fill="#87CEEB"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (soaring eternally) -->
          <rect x="11" y="16" width="12" height="10" fill="#F0F8FF"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#F0F8FF"/>
          <!-- Eternal flame crest (intense) -->
          <rect x="15" y="4" width="2" height="4" fill="#E6E6FA"/>
          <rect x="17" y="4" width="2" height="4" fill="#F0F8FF"/>
          <rect x="14" y="2" width="1" height="2" fill="#FFFFFF"/>
          <rect x="18" y="2" width="1" height="2" fill="#FFFFFF"/>
          <rect x="16" y="1" width="2" height="1" fill="#87CEEB"/>
          <!-- Beak -->
          <rect x="15" y="12" width="4" height="2" fill="#C0C0C0"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#87CEEB"/>
          <rect x="18" y="10" width="2" height="2" fill="#87CEEB"/>
          <!-- Wings (spread with eternal light) -->
          <rect x="3" y="12" width="9" height="8" fill="#F0F8FF"/>
          <rect x="20" y="12" width="9" height="8" fill="#F0F8FF"/>
          <rect x="1" y="14" width="5" height="6" fill="#E6E6FA"/>
          <rect x="26" y="14" width="5" height="6" fill="#E6E6FA"/>
          <rect x="0" y="15" width="3" height="4" fill="#87CEEB"/>
          <rect x="29" y="15" width="3" height="4" fill="#87CEEB"/>
          <!-- Feet (flying position) -->
          <rect x="10" y="26" width="3" height="3" fill="#C0C0C0"/>
          <rect x="18" y="26" width="3" height="3" fill="#C0C0C0"/>
          <!-- Eternal light trail -->
          <rect x="5" y="18" width="2" height="2" fill="#F0F8FF"/>
          <rect x="3" y="20" width="2" height="2" fill="#E6E6FA"/>
          <rect x="1" y="22" width="2" height="2" fill="#87CEEB"/>
          <!-- Intense eternal aura -->
          <rect x="0" y="12" width="1" height="1" fill="#FFFFFF"/>
          <rect x="31" y="14" width="1" height="1" fill="#87CEEB"/>
          <rect x="2" y="10" width="1" height="1" fill="#E6E6FA"/>
          <rect x="29" y="12" width="1" height="1" fill="#FFFFFF"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="10" fill="#F0F8FF"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#F0F8FF"/>
          <!-- Eternal flame crest -->
          <rect x="15" y="4" width="2" height="4" fill="#E6E6FA"/>
          <rect x="17" y="4" width="2" height="4" fill="#F0F8FF"/>
          <rect x="14" y="2" width="1" height="2" fill="#FFFFFF"/>
          <rect x="18" y="2" width="1" height="2" fill="#FFFFFF"/>
          <!-- Beak -->
          <rect x="15" y="12" width="4" height="2" fill="#C0C0C0"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#87CEEB"/>
          <rect x="18" y="10" width="2" height="2" fill="#87CEEB"/>
          <!-- Wings (folded with eternal glow) -->
          <rect x="6" y="16" width="6" height="8" fill="#F0F8FF"/>
          <rect x="20" y="16" width="6" height="8" fill="#F0F8FF"/>
          <rect x="5" y="17" width="4" height="6" fill="#E6E6FA"/>
          <rect x="23" y="17" width="4" height="6" fill="#E6E6FA"/>
          <!-- Feet (walking) -->
          <rect x="13" y="26" width="3" height="3" fill="#C0C0C0"/>
          <rect x="16" y="26" width="3" height="3" fill="#C0C0C0"/>
          <!-- Eternal aura -->
          <rect x="4" y="14" width="1" height="1" fill="#FFFFFF"/>
          <rect x="27" y="15" width="1" height="1" fill="#87CEEB"/>
          <rect x="7" y="12" width="1" height="1" fill="#E6E6FA"/>
          <rect x="24" y="13" width="1" height="1" fill="#FFFFFF"/>
        </svg>
      `)
    ],
    name: 'Eternal Phoenix'
  },
  // Golden Phoenix - Legendary pet with golden flames
  '🔆': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="10" fill="#FFD700"/>
          <!-- Head -->
          <rect x="12" y="8" width="8" height="8" fill="#FFD700"/>
          <!-- Golden flame crest -->
          <rect x="14" y="4" width="2" height="4" fill="#FFA500"/>
          <rect x="16" y="4" width="2" height="4" fill="#FFD700"/>
          <rect x="13" y="2" width="1" height="2" fill="#FFFF00"/>
          <rect x="17" y="2" width="1" height="2" fill="#FFFF00"/>
          <rect x="15" y="1" width="2" height="1" fill="#FFFFFF"/>
          <!-- Beak -->
          <rect x="14" y="12" width="4" height="2" fill="#FF8C00"/>
          <!-- Eyes (golden) -->
          <rect x="13" y="10" width="2" height="2" fill="#FF8C00"/>
          <rect x="17" y="10" width="2" height="2" fill="#FF8C00"/>
          <rect x="13" y="10" width="1" height="1" fill="#FFFF00"/>
          <rect x="17" y="10" width="1" height="1" fill="#FFFF00"/>
          <!-- Wings (golden with flame effect) -->
          <rect x="8" y="18" width="4" height="6" fill="#FFD700"/>
          <rect x="20" y="18" width="4" height="6" fill="#FFD700"/>
          <rect x="6" y="19" width="2" height="4" fill="#FFA500"/>
          <rect x="24" y="19" width="2" height="4" fill="#FFA500"/>
          <rect x="5" y="20" width="1" height="2" fill="#FF8C00"/>
          <rect x="26" y="20" width="1" height="2" fill="#FF8C00"/>
          <!-- Feet -->
          <rect x="12" y="26" width="3" height="3" fill="#FF8C00"/>
          <rect x="17" y="26" width="3" height="3" fill="#FF8C00"/>
          <!-- Golden aura -->
          <rect x="8" y="14" width="1" height="1" fill="#FFFF00"/>
          <rect x="23" y="15" width="1" height="1" fill="#FFFF00"/>
          <rect x="6" y="17" width="1" height="1" fill="#FFD700"/>
          <rect x="25" y="18" width="1" height="1" fill="#FFD700"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="10" fill="#FFD700"/>
          <!-- Head -->
          <rect x="12" y="7" width="8" height="8" fill="#FFD700"/>
          <!-- Golden flame crest (flickering) -->
          <rect x="14" y="3" width="2" height="4" fill="#FFA500"/>
          <rect x="16" y="3" width="2" height="4" fill="#FFD700"/>
          <rect x="13" y="1" width="1" height="2" fill="#FFFF00"/>
          <rect x="17" y="1" width="1" height="2" fill="#FFFF00"/>
          <rect x="15" y="2" width="2" height="1" fill="#FFFFFF"/>
          <!-- Beak -->
          <rect x="14" y="11" width="4" height="2" fill="#FF8C00"/>
          <!-- Eyes (glowing) -->
          <rect x="13" y="9" width="2" height="2" fill="#FF8C00"/>
          <rect x="17" y="9" width="2" height="2" fill="#FF8C00"/>
          <rect x="14" y="9" width="1" height="1" fill="#FFFF00"/>
          <rect x="18" y="9" width="1" height="1" fill="#FFFF00"/>
          <!-- Wings (golden with intense flame) -->
          <rect x="7" y="17" width="5" height="7" fill="#FFD700"/>
          <rect x="20" y="17" width="5" height="7" fill="#FFD700"/>
          <rect x="5" y="18" width="3" height="5" fill="#FFA500"/>
          <rect x="24" y="18" width="3" height="5" fill="#FFA500"/>
          <rect x="4" y="19" width="2" height="3" fill="#FF8C00"/>
          <rect x="26" y="19" width="2" height="3" fill="#FF8C00"/>
          <!-- Feet -->
          <rect x="12" y="25" width="3" height="3" fill="#FF8C00"/>
          <rect x="17" y="25" width="3" height="3" fill="#FF8C00"/>
          <!-- Golden aura (intense) -->
          <rect x="7" y="13" width="1" height="1" fill="#FFFF00"/>
          <rect x="24" y="14" width="1" height="1" fill="#FFFF00"/>
          <rect x="5" y="16" width="1" height="1" fill="#FFD700"/>
          <rect x="26" y="17" width="1" height="1" fill="#FFD700"/>
          <rect x="9" y="12" width="1" height="1" fill="#FFFFFF"/>
          <rect x="22" y="13" width="1" height="1" fill="#FFFFFF"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (soaring) -->
          <rect x="11" y="16" width="12" height="10" fill="#FFD700"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#FFD700"/>
          <!-- Golden flame crest (intense) -->
          <rect x="15" y="4" width="2" height="4" fill="#FFA500"/>
          <rect x="17" y="4" width="2" height="4" fill="#FFD700"/>
          <rect x="14" y="2" width="1" height="2" fill="#FFFF00"/>
          <rect x="18" y="2" width="1" height="2" fill="#FFFF00"/>
          <rect x="16" y="1" width="2" height="1" fill="#FFFFFF"/>
          <!-- Beak -->
          <rect x="15" y="12" width="4" height="2" fill="#FF8C00"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#FF8C00"/>
          <rect x="18" y="10" width="2" height="2" fill="#FF8C00"/>
          <!-- Wings (spread with golden fire) -->
          <rect x="3" y="12" width="9" height="8" fill="#FFD700"/>
          <rect x="20" y="12" width="9" height="8" fill="#FFD700"/>
          <rect x="1" y="14" width="5" height="6" fill="#FFA500"/>
          <rect x="26" y="14" width="5" height="6" fill="#FFA500"/>
          <rect x="0" y="15" width="3" height="4" fill="#FF8C00"/>
          <rect x="29" y="15" width="3" height="4" fill="#FF8C00"/>
          <!-- Feet (flying position) -->
          <rect x="10" y="26" width="3" height="3" fill="#FF8C00"/>
          <rect x="18" y="26" width="3" height="3" fill="#FF8C00"/>
          <!-- Golden fire trail -->
          <rect x="5" y="18" width="2" height="2" fill="#FFD700"/>
          <rect x="3" y="20" width="2" height="2" fill="#FFA500"/>
          <rect x="1" y="22" width="2" height="2" fill="#FFFF00"/>
          <!-- Intense golden aura -->
          <rect x="0" y="12" width="1" height="1" fill="#FFFF00"/>
          <rect x="31" y="14" width="1" height="1" fill="#FFFF00"/>
          <rect x="2" y="10" width="1" height="1" fill="#FFD700"/>
          <rect x="29" y="12" width="1" height="1" fill="#FFD700"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="10" fill="#FFD700"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#FFD700"/>
          <!-- Golden flame crest -->
          <rect x="15" y="4" width="2" height="4" fill="#FFA500"/>
          <rect x="17" y="4" width="2" height="4" fill="#FFD700"/>
          <rect x="14" y="2" width="1" height="2" fill="#FFFF00"/>
          <rect x="18" y="2" width="1" height="2" fill="#FFFF00"/>
          <!-- Beak -->
          <rect x="15" y="12" width="4" height="2" fill="#FF8C00"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#FF8C00"/>
          <rect x="18" y="10" width="2" height="2" fill="#FF8C00"/>
          <!-- Wings (folded with golden glow) -->
          <rect x="6" y="16" width="6" height="8" fill="#FFD700"/>
          <rect x="20" y="16" width="6" height="8" fill="#FFD700"/>
          <rect x="5" y="17" width="4" height="6" fill="#FFA500"/>
          <rect x="23" y="17" width="4" height="6" fill="#FFA500"/>
          <!-- Feet (walking) -->
          <rect x="13" y="26" width="3" height="3" fill="#FF8C00"/>
          <rect x="16" y="26" width="3" height="3" fill="#FF8C00"/>
          <!-- Golden aura -->
          <rect x="4" y="14" width="1" height="1" fill="#FFFF00"/>
          <rect x="27" y="15" width="1" height="1" fill="#FFFF00"/>
          <rect x="7" y="12" width="1" height="1" fill="#FFD700"/>
          <rect x="24" y="13" width="1" height="1" fill="#FFD700"/>
        </svg>
      `)
    ],
    name: 'Golden Phoenix'
  },
  // Ancient Dragon - Legendary pet with cosmic energy
  '💚': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="8" fill="#2E8B57"/>
          <!-- Head -->
          <rect x="12" y="8" width="8" height="8" fill="#2E8B57"/>
          <!-- Snout -->
          <rect x="8" y="12" width="4" height="4" fill="#2E8B57"/>
          <!-- Eyes (ancient wisdom) -->
          <rect x="13" y="10" width="2" height="2" fill="#9370DB"/>
          <rect x="17" y="10" width="2" height="2" fill="#9370DB"/>
          <rect x="13" y="10" width="1" height="1" fill="#E6E6FA"/>
          <rect x="17" y="10" width="1" height="1" fill="#E6E6FA"/>
          <!-- Nostrils -->
          <rect x="9" y="13" width="1" height="1" fill="#000000"/>
          <rect x="10" y="13" width="1" height="1" fill="#000000"/>
          <!-- Wings (ancient runic patterns) -->
          <rect x="6" y="14" width="6" height="8" fill="#228B22"/>
          <rect x="20" y="14" width="6" height="8" fill="#228B22"/>
          <!-- Wing runes -->
          <rect x="7" y="16" width="1" height="1" fill="#9370DB"/>
          <rect x="9" y="18" width="1" height="1" fill="#9370DB"/>
          <rect x="22" y="16" width="1" height="1" fill="#9370DB"/>
          <rect x="24" y="18" width="1" height="1" fill="#9370DB"/>
          <!-- Legs -->
          <rect x="12" y="24" width="3" height="4" fill="#2E8B57"/>
          <rect x="17" y="24" width="3" height="4" fill="#2E8B57"/>
          <!-- Tail with ancient spikes -->
          <rect x="22" y="20" width="4" height="2" fill="#2E8B57"/>
          <rect x="24" y="18" width="2" height="2" fill="#2E8B57"/>
          <!-- Ancient spikes on back -->
          <rect x="14" y="14" width="2" height="2" fill="#9370DB"/>
          <rect x="16" y="14" width="2" height="2" fill="#9370DB"/>
          <!-- Ancient aura -->
          <rect x="6" y="6" width="1" height="1" fill="#9370DB"/>
          <rect x="25" y="8" width="1" height="1" fill="#9370DB"/>
          <rect x="4" y="12" width="1" height="1" fill="#E6E6FA"/>
          <rect x="27" y="14" width="1" height="1" fill="#E6E6FA"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="8" fill="#2E8B57"/>
          <!-- Head -->
          <rect x="12" y="7" width="8" height="8" fill="#2E8B57"/>
          <!-- Snout -->
          <rect x="8" y="11" width="4" height="4" fill="#2E8B57"/>
          <!-- Eyes (glowing with ancient power) -->
          <rect x="13" y="9" width="2" height="2" fill="#9370DB"/>
          <rect x="17" y="9" width="2" height="2" fill="#9370DB"/>
          <rect x="12" y="8" width="1" height="1" fill="#E6E6FA"/>
          <rect x="19" y="8" width="1" height="1" fill="#E6E6FA"/>
          <!-- Nostrils -->
          <rect x="9" y="12" width="1" height="1" fill="#000000"/>
          <rect x="10" y="12" width="1" height="1" fill="#000000"/>
          <!-- Wings (pulsing with magic) -->
          <rect x="5" y="12" width="7" height="9" fill="#228B22"/>
          <rect x="20" y="12" width="7" height="9" fill="#228B22"/>
          <!-- Magical runes (pulsing) -->
          <rect x="6" y="14" width="2" height="2" fill="#9370DB"/>
          <rect x="8" y="16" width="2" height="2" fill="#E6E6FA"/>
          <rect x="22" y="14" width="2" height="2" fill="#9370DB"/>
          <rect x="24" y="16" width="2" height="2" fill="#E6E6FA"/>
          <!-- Legs -->
          <rect x="12" y="23" width="3" height="4" fill="#2E8B57"/>
          <rect x="17" y="23" width="3" height="4" fill="#2E8B57"/>
          <!-- Tail -->
          <rect x="22" y="19" width="4" height="2" fill="#2E8B57"/>
          <rect x="24" y="17" width="2" height="2" fill="#2E8B57"/>
          <!-- Ancient spikes (glowing) -->
          <rect x="14" y="13" width="2" height="2" fill="#9370DB"/>
          <rect x="16" y="13" width="2" height="2" fill="#E6E6FA"/>
          <!-- Ancient aura (enhanced) -->
          <rect x="5" y="5" width="1" height="1" fill="#9370DB"/>
          <rect x="26" y="7" width="1" height="1" fill="#9370DB"/>
          <rect x="3" y="11" width="1" height="1" fill="#E6E6FA"/>
          <rect x="28" y="13" width="1" height="1" fill="#E6E6FA"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#2E8B57"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#2E8B57"/>
          <!-- Snout -->
          <rect x="9" y="12" width="4" height="4" fill="#2E8B57"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#9370DB"/>
          <rect x="18" y="10" width="2" height="2" fill="#9370DB"/>
          <!-- Nostrils with ancient breath -->
          <rect x="6" y="13" width="3" height="1" fill="#9370DB"/>
          <rect x="5" y="14" width="2" height="1" fill="#E6E6FA"/>
          <!-- Wings (extended with runic magic) -->
          <rect x="3" y="10" width="9" height="10" fill="#228B22"/>
          <rect x="20" y="10" width="9" height="10" fill="#228B22"/>
          <!-- Enhanced magical runes -->
          <rect x="4" y="12" width="2" height="2" fill="#9370DB"/>
          <rect x="6" y="14" width="2" height="2" fill="#E6E6FA"/>
          <rect x="8" y="16" width="2" height="2" fill="#9370DB"/>
          <rect x="22" y="12" width="2" height="2" fill="#9370DB"/>
          <rect x="24" y="14" width="2" height="2" fill="#E6E6FA"/>
          <rect x="26" y="16" width="2" height="2" fill="#9370DB"/>
          <!-- Legs (powerful stride) -->
          <rect x="11" y="24" width="3" height="4" fill="#2E8B57"/>
          <rect x="18" y="24" width="3" height="4" fill="#2E8B57"/>
          <!-- Tail -->
          <rect x="23" y="20" width="4" height="2" fill="#2E8B57"/>
          <rect x="25" y="18" width="2" height="2" fill="#2E8B57"/>
          <!-- Ancient power trail -->
          <rect x="2" y="18" width="2" height="2" fill="#9370DB"/>
          <rect x="1" y="20" width="2" height="2" fill="#E6E6FA"/>
          <!-- Powerful ancient aura -->
          <rect x="0" y="12" width="1" height="1" fill="#9370DB"/>
          <rect x="31" y="14" width="1" height="1" fill="#9370DB"/>
          <rect x="2" y="8" width="1" height="1" fill="#E6E6FA"/>
          <rect x="29" y="10" width="1" height="1" fill="#E6E6FA"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#2E8B57"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#2E8B57"/>
          <!-- Snout -->
          <rect x="9" y="12" width="4" height="4" fill="#2E8B57"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#9370DB"/>
          <rect x="18" y="10" width="2" height="2" fill="#9370DB"/>
          <!-- Nostrils -->
          <rect x="10" y="13" width="1" height="1" fill="#000000"/>
          <rect x="11" y="13" width="1" height="1" fill="#000000"/>
          <!-- Wings (ancient power) -->
          <rect x="4" y="12" width="8" height="9" fill="#228B22"/>
          <rect x="20" y="12" width="8" height="9" fill="#228B22"/>
          <!-- Runic patterns -->
          <rect x="5" y="14" width="2" height="2" fill="#9370DB"/>
          <rect x="7" y="16" width="2" height="2" fill="#E6E6FA"/>
          <rect x="21" y="14" width="2" height="2" fill="#9370DB"/>
          <rect x="23" y="16" width="2" height="2" fill="#E6E6FA"/>
          <!-- Legs (walking) -->
          <rect x="13" y="24" width="3" height="4" fill="#2E8B57"/>
          <rect x="16" y="24" width="3" height="4" fill="#2E8B57"/>
          <!-- Tail -->
          <rect x="23" y="20" width="4" height="2" fill="#2E8B57"/>
          <rect x="25" y="18" width="2" height="2" fill="#2E8B57"/>
          <!-- Ancient aura -->
          <rect x="3" y="10" width="1" height="1" fill="#9370DB"/>
          <rect x="28" y="12" width="1" height="1" fill="#9370DB"/>
          <rect x="6" y="8" width="1" height="1" fill="#E6E6FA"/>
          <rect x="25" y="10" width="1" height="1" fill="#E6E6FA"/>
        </svg>
      `)
    ],
    name: 'Ancient Dragon'
  },
  // Cosmic Wolf - Legendary pet with starfield pattern
  '🌌': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="8" fill="#191970"/>
          <!-- Head -->
          <rect x="12" y="8" width="8" height="8" fill="#191970"/>
          <!-- Snout -->
          <rect x="8" y="12" width="4" height="4" fill="#191970"/>
          <!-- Ears -->
          <rect x="12" y="6" width="3" height="3" fill="#191970"/>
          <rect x="17" y="6" width="3" height="3" fill="#191970"/>
          <!-- Inner ears -->
          <rect x="13" y="7" width="1" height="1" fill="#4169E1"/>
          <rect x="18" y="7" width="1" height="1" fill="#4169E1"/>
          <!-- Eyes (cosmic stars) -->
          <rect x="13" y="10" width="2" height="2" fill="#E6E6FA"/>
          <rect x="17" y="10" width="2" height="2" fill="#E6E6FA"/>
          <rect x="13" y="10" width="1" height="1" fill="#FFFF00"/>
          <rect x="17" y="10" width="1" height="1" fill="#FFFF00"/>
          <!-- Nose -->
          <rect x="9" y="13" width="2" height="2" fill="#4169E1"/>
          <!-- Mouth -->
          <rect x="10" y="15" width="3" height="1" fill="#E6E6FA"/>
          <!-- Arms -->
          <rect x="8" y="18" width="3" height="4" fill="#191970"/>
          <rect x="21" y="18" width="3" height="4" fill="#191970"/>
          <!-- Legs -->
          <rect x="12" y="24" width="3" height="4" fill="#191970"/>
          <rect x="17" y="24" width="3" height="4" fill="#191970"/>
          <!-- Cosmic tail -->
          <rect x="22" y="18" width="2" height="6" fill="#191970"/>
          <rect x="24" y="20" width="2" height="4" fill="#4169E1"/>
          <!-- Star patterns on body -->
          <rect x="13" y="18" width="1" height="1" fill="#FFFF00"/>
          <rect x="17" y="19" width="1" height="1" fill="#E6E6FA"/>
          <rect x="15" y="20" width="1" height="1" fill="#FFFF00"/>
          <!-- Cosmic aura -->
          <rect x="6" y="6" width="1" height="1" fill="#FFFF00"/>
          <rect x="25" y="8" width="1" height="1" fill="#E6E6FA"/>
          <rect x="4" y="12" width="1" height="1" fill="#4169E1"/>
          <rect x="27" y="14" width="1" height="1" fill="#FFFF00"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="8" fill="#191970"/>
          <!-- Head -->
          <rect x="12" y="7" width="8" height="8" fill="#191970"/>
          <!-- Snout -->
          <rect x="8" y="11" width="4" height="4" fill="#191970"/>
          <!-- Ears -->
          <rect x="12" y="5" width="3" height="3" fill="#191970"/>
          <rect x="17" y="5" width="3" height="3" fill="#191970"/>
          <!-- Inner ears -->
          <rect x="13" y="6" width="1" height="1" fill="#4169E1"/>
          <rect x="18" y="6" width="1" height="1" fill="#4169E1"/>
          <!-- Eyes (twinkling stars) -->
          <rect x="13" y="9" width="2" height="2" fill="#E6E6FA"/>
          <rect x="17" y="9" width="2" height="2" fill="#E6E6FA"/>
          <rect x="14" y="9" width="1" height="1" fill="#FFFF00"/>
          <rect x="18" y="9" width="1" height="1" fill="#FFFF00"/>
          <!-- Nose -->
          <rect x="9" y="12" width="2" height="2" fill="#4169E1"/>
          <!-- Mouth -->
          <rect x="10" y="14" width="3" height="1" fill="#E6E6FA"/>
          <!-- Arms -->
          <rect x="8" y="17" width="3" height="4" fill="#191970"/>
          <rect x="21" y="17" width="3" height="4" fill="#191970"/>
          <!-- Legs -->
          <rect x="12" y="23" width="3" height="4" fill="#191970"/>
          <rect x="17" y="23" width="3" height="4" fill="#191970"/>
          <!-- Cosmic tail (pulsing) -->
          <rect x="22" y="17" width="2" height="6" fill="#191970"/>
          <rect x="24" y="19" width="2" height="4" fill="#4169E1"/>
          <!-- Enhanced star patterns -->
          <rect x="13" y="17" width="1" height="1" fill="#E6E6FA"/>
          <rect x="17" y="18" width="1" height="1" fill="#FFFF00"/>
          <rect x="15" y="19" width="1" height="1" fill="#E6E6FA"/>
          <rect x="18" y="20" width="1" height="1" fill="#FFFF00"/>
          <!-- Enhanced cosmic aura -->
          <rect x="5" y="5" width="1" height="1" fill="#FFFF00"/>
          <rect x="26" y="7" width="1" height="1" fill="#E6E6FA"/>
          <rect x="3" y="11" width="1" height="1" fill="#4169E1"/>
          <rect x="28" y="13" width="1" height="1" fill="#FFFF00"/>
          <rect x="7" y="4" width="1" height="1" fill="#E6E6FA"/>
          <rect x="24" y="6" width="1" height="1" fill="#4169E1"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#191970"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#191970"/>
          <!-- Snout -->
          <rect x="9" y="12" width="4" height="4" fill="#191970"/>
          <!-- Ears -->
          <rect x="13" y="6" width="3" height="3" fill="#191970"/>
          <rect x="18" y="6" width="3" height="3" fill="#191970"/>
          <!-- Inner ears -->
          <rect x="14" y="7" width="1" height="1" fill="#4169E1"/>
          <rect x="19" y="7" width="1" height="1" fill="#4169E1"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#E6E6FA"/>
          <rect x="18" y="10" width="2" height="2" fill="#E6E6FA"/>
          <!-- Nose -->
          <rect x="10" y="13" width="2" height="2" fill="#4169E1"/>
          <!-- Mouth -->
          <rect x="11" y="15" width="3" height="1" fill="#E6E6FA"/>
          <!-- Arms (cosmic running) -->
          <rect x="7" y="17" width="4" height="5" fill="#191970"/>
          <rect x="21" y="19" width="4" height="3" fill="#191970"/>
          <!-- Legs (running) -->
          <rect x="11" y="24" width="3" height="4" fill="#191970"/>
          <rect x="18" y="24" width="3" height="4" fill="#191970"/>
          <!-- Cosmic tail (streaming) -->
          <rect x="23" y="17" width="2" height="7" fill="#191970"/>
          <rect x="25" y="19" width="2" height="5" fill="#4169E1"/>
          <!-- Cosmic star trail -->
          <rect x="6" y="20" width="1" height="1" fill="#FFFF00"/>
          <rect x="4" y="22" width="1" height="1" fill="#E6E6FA"/>
          <rect x="2" y="24" width="1" height="1" fill="#4169E1"/>
          <rect x="26" y="18" width="1" height="1" fill="#FFFF00"/>
          <rect x="28" y="20" width="1" height="1" fill="#E6E6FA"/>
          <!-- Intense cosmic aura -->
          <rect x="0" y="14" width="1" height="1" fill="#FFFF00"/>
          <rect x="31" y="16" width="1" height="1" fill="#E6E6FA"/>
          <rect x="2" y="10" width="1" height="1" fill="#4169E1"/>
          <rect x="29" y="12" width="1" height="1" fill="#FFFF00"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#191970"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#191970"/>
          <!-- Snout -->
          <rect x="9" y="12" width="4" height="4" fill="#191970"/>
          <!-- Ears -->
          <rect x="13" y="6" width="3" height="3" fill="#191970"/>
          <rect x="18" y="6" width="3" height="3" fill="#191970"/>
          <!-- Inner ears -->
          <rect x="14" y="7" width="1" height="1" fill="#4169E1"/>
          <rect x="19" y="7" width="1" height="1" fill="#4169E1"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#E6E6FA"/>
          <rect x="18" y="10" width="2" height="2" fill="#E6E6FA"/>
          <!-- Nose -->
          <rect x="10" y="13" width="2" height="2" fill="#4169E1"/>
          <!-- Mouth -->
          <rect x="11" y="15" width="3" height="1" fill="#E6E6FA"/>
          <!-- Arms (cosmic running) -->
          <rect x="9" y="19" width="4" height="3" fill="#191970"/>
          <rect x="23" y="17" width="4" height="5" fill="#191970"/>
          <!-- Legs (running) -->
          <rect x="13" y="24" width="3" height="4" fill="#191970"/>
          <rect x="16" y="24" width="3" height="4" fill="#191970"/>
          <!-- Cosmic tail (streaming) -->
          <rect x="21" y="17" width="2" height="7" fill="#191970"/>
          <rect x="19" y="19" width="2" height="5" fill="#4169E1"/>
          <!-- Cosmic star patterns -->
          <rect x="14" y="18" width="1" height="1" fill="#FFFF00"/>
          <rect x="16" y="19" width="1" height="1" fill="#E6E6FA"/>
          <rect x="18" y="20" width="1" height="1" fill="#4169E1"/>
          <!-- Cosmic aura -->
          <rect x="3" y="12" width="1" height="1" fill="#FFFF00"/>
          <rect x="28" y="14" width="1" height="1" fill="#E6E6FA"/>
          <rect x="5" y="8" width="1" height="1" fill="#4169E1"/>
          <rect x="26" y="10" width="1" height="1" fill="#FFFF00"/>
        </svg>
      `)
    ],
    name: 'Cosmic Wolf'
  },
  // Fortune Spirit - Legendary pet with ethereal appearance
  '✨': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (semi-transparent ethereal) -->
          <rect x="10" y="16" width="12" height="8" fill="#E6E6FA" opacity="0.8"/>
          <!-- Head -->
          <rect x="12" y="8" width="8" height="8" fill="#E6E6FA" opacity="0.8"/>
          <!-- Ethereal glow outline -->
          <rect x="9" y="15" width="14" height="10" fill="#DDA0DD" opacity="0.4"/>
          <rect x="11" y="7" width="10" height="10" fill="#DDA0DD" opacity="0.4"/>
          <!-- Eyes (magical sparkles) -->
          <rect x="13" y="10" width="2" height="2" fill="#FFD700"/>
          <rect x="17" y="10" width="2" height="2" fill="#FFD700"/>
          <rect x="12" y="9" width="1" height="1" fill="#FFFFFF"/>
          <rect x="19" y="9" width="1" height="1" fill="#FFFFFF"/>
          <!-- Ethereal features -->
          <rect x="15" y="12" width="2" height="1" fill="#DDA0DD"/>
          <rect x="14" y="14" width="4" height="1" fill="#DDA0DD"/>
          <!-- Floating ethereal limbs -->
          <rect x="8" y="18" width="3" height="4" fill="#E6E6FA" opacity="0.6"/>
          <rect x="21" y="18" width="3" height="4" fill="#E6E6FA" opacity="0.6"/>
          <rect x="12" y="24" width="3" height="4" fill="#E6E6FA" opacity="0.6"/>
          <rect x="17" y="24" width="3" height="4" fill="#E6E6FA" opacity="0.6"/>
          <!-- Ethereal tail -->
          <rect x="22" y="18" width="2" height="6" fill="#E6E6FA" opacity="0.6"/>
          <rect x="24" y="20" width="2" height="4" fill="#DDA0DD" opacity="0.6"/>
          <!-- Fortune sparkles around body -->
          <rect x="11" y="16" width="1" height="1" fill="#FFD700"/>
          <rect x="18" y="17" width="1" height="1" fill="#FFFF00"/>
          <rect x="14" y="19" width="1" height="1" fill="#FFD700"/>
          <rect x="16" y="21" width="1" height="1" fill="#FFFF00"/>
          <!-- Ethereal aura -->
          <rect x="6" y="6" width="1" height="1" fill="#DDA0DD"/>
          <rect x="25" y="8" width="1" height="1" fill="#E6E6FA"/>
          <rect x="4" y="12" width="1" height="1" fill="#FFD700"/>
          <rect x="27" y="14" width="1" height="1" fill="#FFFF00"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (pulsing ethereal) -->
          <rect x="10" y="15" width="12" height="8" fill="#E6E6FA" opacity="0.9"/>
          <!-- Head -->
          <rect x="12" y="7" width="8" height="8" fill="#E6E6FA" opacity="0.9"/>
          <!-- Enhanced ethereal glow -->
          <rect x="9" y="14" width="14" height="10" fill="#DDA0DD" opacity="0.5"/>
          <rect x="11" y="6" width="10" height="10" fill="#DDA0DD" opacity="0.5"/>
          <!-- Eyes (glowing brighter) -->
          <rect x="13" y="9" width="2" height="2" fill="#FFD700"/>
          <rect x="17" y="9" width="2" height="2" fill="#FFD700"/>
          <rect x="12" y="8" width="1" height="1" fill="#FFFFFF"/>
          <rect x="19" y="8" width="1" height="1" fill="#FFFFFF"/>
          <rect x="14" y="8" width="1" height="1" fill="#FFFF00"/>
          <rect x="18" y="8" width="1" height="1" fill="#FFFF00"/>
          <!-- Ethereal features -->
          <rect x="15" y="11" width="2" height="1" fill="#DDA0DD"/>
          <rect x="14" y="13" width="4" height="1" fill="#DDA0DD"/>
          <!-- Floating limbs (more ethereal) -->
          <rect x="8" y="17" width="3" height="4" fill="#E6E6FA" opacity="0.7"/>
          <rect x="21" y="17" width="3" height="4" fill="#E6E6FA" opacity="0.7"/>
          <rect x="12" y="23" width="3" height="4" fill="#E6E6FA" opacity="0.7"/>
          <rect x="17" y="23" width="3" height="4" fill="#E6E6FA" opacity="0.7"/>
          <!-- Ethereal tail (flowing) -->
          <rect x="22" y="17" width="2" height="6" fill="#E6E6FA" opacity="0.7"/>
          <rect x="24" y="19" width="2" height="4" fill="#DDA0DD" opacity="0.7"/>
          <!-- Enhanced fortune sparkles -->
          <rect x="11" y="15" width="1" height="1" fill="#FFFF00"/>
          <rect x="18" y="16" width="1" height="1" fill="#FFD700"/>
          <rect x="14" y="18" width="1" height="1" fill="#FFFF00"/>
          <rect x="16" y="20" width="1" height="1" fill="#FFD700"/>
          <rect x="19" y="19" width="1" height="1" fill="#FFFF00"/>
          <!-- Enhanced ethereal aura -->
          <rect x="5" y="5" width="1" height="1" fill="#DDA0DD"/>
          <rect x="26" y="7" width="1" height="1" fill="#E6E6FA"/>
          <rect x="3" y="11" width="1" height="1" fill="#FFD700"/>
          <rect x="28" y="13" width="1" height="1" fill="#FFFF00"/>
          <rect x="7" y="4" width="1" height="1" fill="#FFFFFF"/>
          <rect x="24" y="6" width="1" height="1" fill="#FFFFFF"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (floating ethereal) -->
          <rect x="11" y="14" width="12" height="8" fill="#E6E6FA" opacity="0.8"/>
          <!-- Head -->
          <rect x="13" y="6" width="8" height="8" fill="#E6E6FA" opacity="0.8"/>
          <!-- Flowing ethereal aura -->
          <rect x="10" y="13" width="14" height="10" fill="#DDA0DD" opacity="0.4"/>
          <rect x="12" y="5" width="10" height="10" fill="#DDA0DD" opacity="0.4"/>
          <!-- Eyes -->
          <rect x="14" y="8" width="2" height="2" fill="#FFD700"/>
          <rect x="18" y="8" width="2" height="2" fill="#FFD700"/>
          <!-- Ethereal features -->
          <rect x="16" y="10" width="2" height="1" fill="#DDA0DD"/>
          <rect x="15" y="12" width="4" height="1" fill="#DDA0DD"/>
          <!-- Floating limbs (flowing motion) -->
          <rect x="7" y="16" width="4" height="5" fill="#E6E6FA" opacity="0.6"/>
          <rect x="21" y="18" width="4" height="3" fill="#E6E6FA" opacity="0.6"/>
          <rect x="11" y="22" width="3" height="4" fill="#E6E6FA" opacity="0.6"/>
          <rect x="18" y="22" width="3" height="4" fill="#E6E6FA" opacity="0.6"/>
          <!-- Ethereal tail (streaming) -->
          <rect x="23" y="16" width="2" height="7" fill="#E6E6FA" opacity="0.6"/>
          <rect x="25" y="18" width="2" height="5" fill="#DDA0DD" opacity="0.6"/>
          <!-- Fortune sparkle trail -->
          <rect x="5" y="18" width="1" height="1" fill="#FFD700"/>
          <rect x="3" y="20" width="1" height="1" fill="#FFFF00"/>
          <rect x="1" y="22" width="1" height="1" fill="#DDA0DD"/>
          <rect x="26" y="16" width="1" height="1" fill="#FFD700"/>
          <rect x="28" y="18" width="1" height="1" fill="#FFFF00"/>
          <!-- Intense ethereal aura -->
          <rect x="0" y="12" width="1" height="1" fill="#DDA0DD"/>
          <rect x="31" y="14" width="1" height="1" fill="#E6E6FA"/>
          <rect x="2" y="8" width="1" height="1" fill="#FFD700"/>
          <rect x="29" y="10" width="1" height="1" fill="#FFFF00"/>
          <rect x="4" y="6" width="1" height="1" fill="#FFFFFF"/>
          <rect x="27" y="8" width="1" height="1" fill="#FFFFFF"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (ethereal floating) -->
          <rect x="11" y="16" width="12" height="8" fill="#E6E6FA" opacity="0.8"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#E6E6FA" opacity="0.8"/>
          <!-- Ethereal aura -->
          <rect x="10" y="15" width="14" height="10" fill="#DDA0DD" opacity="0.4"/>
          <rect x="12" y="7" width="10" height="10" fill="#DDA0DD" opacity="0.4"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#FFD700"/>
          <rect x="18" y="10" width="2" height="2" fill="#FFD700"/>
          <!-- Ethereal features -->
          <rect x="16" y="12" width="2" height="1" fill="#DDA0DD"/>
          <rect x="15" y="14" width="4" height="1" fill="#DDA0DD"/>
          <!-- Floating limbs -->
          <rect x="9" y="18" width="4" height="3" fill="#E6E6FA" opacity="0.6"/>
          <rect x="23" y="16" width="4" height="5" fill="#E6E6FA" opacity="0.6"/>
          <rect x="13" y="24" width="3" height="4" fill="#E6E6FA" opacity="0.6"/>
          <rect x="16" y="24" width="3" height="4" fill="#E6E6FA" opacity="0.6"/>
          <!-- Ethereal tail -->
          <rect x="21" y="16" width="2" height="7" fill="#E6E6FA" opacity="0.6"/>
          <rect x="19" y="18" width="2" height="5" fill="#DDA0DD" opacity="0.6"/>
          <!-- Fortune sparkles -->
          <rect x="14" y="18" width="1" height="1" fill="#FFD700"/>
          <rect x="16" y="19" width="1" height="1" fill="#FFFF00"/>
          <rect x="18" y="20" width="1" height="1" fill="#DDA0DD"/>
          <!-- Ethereal aura -->
          <rect x="3" y="10" width="1" height="1" fill="#DDA0DD"/>
          <rect x="28" y="12" width="1" height="1" fill="#E6E6FA"/>
          <rect x="5" y="6" width="1" height="1" fill="#FFD700"/>
          <rect x="26" y="8" width="1" height="1" fill="#FFFF00"/>
        </svg>
      `)
    ],
    name: 'Fortune Spirit'
  },
  // Royal Griffin - Legendary pet with majestic appearance
  '👑': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (royal purple) -->
          <rect x="12" y="16" width="8" height="8" fill="#800080"/>
          <!-- Head (eagle-like) -->
          <rect x="14" y="8" width="4" height="8" fill="#FFFFFF"/>
          <!-- Royal crown -->
          <rect x="13" y="6" width="6" height="2" fill="#FFD700"/>
          <rect x="14" y="4" width="1" height="2" fill="#FFD700"/>
          <rect x="16" y="4" width="1" height="2" fill="#FFD700"/>
          <rect x="18" y="4" width="1" height="2" fill="#FFD700"/>
          <!-- Crown jewels -->
          <rect x="14" y="5" width="1" height="1" fill="#FF0000"/>
          <rect x="16" y="5" width="1" height="1" fill="#0000FF"/>
          <rect x="18" y="5" width="1" height="1" fill="#00FF00"/>
          <!-- Beak (golden) -->
          <rect x="12" y="12" width="2" height="2" fill="#FFD700"/>
          <!-- Eyes (royal blue) -->
          <rect x="15" y="10" width="2" height="2" fill="#4169E1"/>
          <!-- Wings (majestic spread) -->
          <rect x="4" y="14" width="8" height="6" fill="#800080"/>
          <rect x="20" y="14" width="8" height="6" fill="#800080"/>
          <!-- Wing patterns (royal) -->
          <rect x="5" y="15" width="6" height="1" fill="#FFD700"/>
          <rect x="6" y="17" width="4" height="1" fill="#FFD700"/>
          <rect x="21" y="15" width="6" height="1" fill="#FFD700"/>
          <rect x="22" y="17" width="4" height="1" fill="#FFD700"/>
          <!-- Wing tips -->
          <rect x="2" y="16" width="4" height="4" fill="#4B0082"/>
          <rect x="26" y="16" width="4" height="4" fill="#4B0082"/>
          <!-- Tail feathers (royal) -->
          <rect x="16" y="24" width="2" height="4" fill="#800080"/>
          <rect x="14" y="26" width="2" height="2" fill="#FFD700"/>
          <rect x="18" y="26" width="2" height="2" fill="#FFD700"/>
          <!-- Legs (golden talons) -->
          <rect x="14" y="24" width="2" height="3" fill="#FFD700"/>
          <rect x="16" y="24" width="2" height="3" fill="#FFD700"/>
          <!-- Talons -->
          <rect x="13" y="27" width="3" height="1" fill="#FFD700"/>
          <rect x="16" y="27" width="3" height="1" fill="#FFD700"/>
          <!-- Royal aura -->
          <rect x="6" y="6" width="1" height="1" fill="#FFD700"/>
          <rect x="25" y="8" width="1" height="1" fill="#4169E1"/>
          <rect x="4" y="12" width="1" height="1" fill="#800080"/>
          <rect x="27" y="14" width="1" height="1" fill="#FFD700"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="12" y="15" width="8" height="8" fill="#800080"/>
          <!-- Head -->
          <rect x="14" y="7" width="4" height="8" fill="#FFFFFF"/>
          <!-- Royal crown (glowing) -->
          <rect x="13" y="5" width="6" height="2" fill="#FFD700"/>
          <rect x="14" y="3" width="1" height="2" fill="#FFD700"/>
          <rect x="16" y="3" width="1" height="2" fill="#FFD700"/>
          <rect x="18" y="3" width="1" height="2" fill="#FFD700"/>
          <!-- Crown jewels (sparkling) -->
          <rect x="14" y="4" width="1" height="1" fill="#FF0000"/>
          <rect x="16" y="4" width="1" height="1" fill="#0000FF"/>
          <rect x="18" y="4" width="1" height="1" fill="#00FF00"/>
          <rect x="15" y="2" width="1" height="1" fill="#FFFFFF"/>
          <rect x="17" y="2" width="1" height="1" fill="#FFFFFF"/>
          <!-- Beak -->
          <rect x="12" y="11" width="2" height="2" fill="#FFD700"/>
          <!-- Eyes (majestic) -->
          <rect x="15" y="9" width="2" height="2" fill="#4169E1"/>
          <rect x="16" y="8" width="1" height="1" fill="#FFFFFF"/>
          <!-- Wings (fluttering majestically) -->
          <rect x="3" y="13" width="9" height="7" fill="#800080"/>
          <rect x="20" y="13" width="9" height="7" fill="#800080"/>
          <!-- Enhanced wing patterns -->
          <rect x="4" y="14" width="7" height="1" fill="#FFD700"/>
          <rect x="5" y="16" width="5" height="1" fill="#FFD700"/>
          <rect x="6" y="18" width="3" height="1" fill="#4169E1"/>
          <rect x="21" y="14" width="7" height="1" fill="#FFD700"/>
          <rect x="22" y="16" width="5" height="1" fill="#FFD700"/>
          <rect x="23" y="18" width="3" height="1" fill="#4169E1"/>
          <!-- Wing tips -->
          <rect x="1" y="15" width="4" height="5" fill="#4B0082"/>
          <rect x="27" y="15" width="4" height="5" fill="#4B0082"/>
          <!-- Tail feathers -->
          <rect x="16" y="23" width="2" height="4" fill="#800080"/>
          <rect x="14" y="25" width="2" height="2" fill="#FFD700"/>
          <rect x="18" y="25" width="2" height="2" fill="#FFD700"/>
          <!-- Legs -->
          <rect x="14" y="23" width="2" height="3" fill="#FFD700"/>
          <rect x="16" y="23" width="2" height="3" fill="#FFD700"/>
          <!-- Talons -->
          <rect x="13" y="26" width="3" height="1" fill="#FFD700"/>
          <rect x="16" y="26" width="3" height="1" fill="#FFD700"/>
          <!-- Enhanced royal aura -->
          <rect x="5" y="5" width="1" height="1" fill="#FFD700"/>
          <rect x="26" y="7" width="1" height="1" fill="#4169E1"/>
          <rect x="3" y="11" width="1" height="1" fill="#800080"/>
          <rect x="28" y="13" width="1" height="1" fill="#FFD700"/>
          <rect x="7" y="3" width="1" height="1" fill="#FFFFFF"/>
          <rect x="24" y="5" width="1" height="1" fill="#FFFFFF"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (soaring majestically) -->
          <rect x="13" y="14" width="8" height="8" fill="#800080"/>
          <!-- Head -->
          <rect x="15" y="6" width="4" height="8" fill="#FFFFFF"/>
          <!-- Royal crown -->
          <rect x="14" y="4" width="6" height="2" fill="#FFD700"/>
          <rect x="15" y="2" width="1" height="2" fill="#FFD700"/>
          <rect x="17" y="2" width="1" height="2" fill="#FFD700"/>
          <rect x="19" y="2" width="1" height="2" fill="#FFD700"/>
          <!-- Crown jewels -->
          <rect x="15" y="3" width="1" height="1" fill="#FF0000"/>
          <rect x="17" y="3" width="1" height="1" fill="#0000FF"/>
          <rect x="19" y="3" width="1" height="1" fill="#00FF00"/>
          <!-- Beak -->
          <rect x="13" y="10" width="2" height="2" fill="#FFD700"/>
          <!-- Eyes -->
          <rect x="16" y="8" width="2" height="2" fill="#4169E1"/>
          <!-- Wings (majestic spread) -->
          <rect x="1" y="8" width="12" height="10" fill="#800080"/>
          <rect x="19" y="8" width="12" height="10" fill="#800080"/>
          <!-- Royal wing patterns -->
          <rect x="2" y="10" width="10" height="1" fill="#FFD700"/>
          <rect x="3" y="12" width="8" height="1" fill="#FFD700"/>
          <rect x="4" y="14" width="6" height="1" fill="#4169E1"/>
          <rect x="20" y="10" width="10" height="1" fill="#FFD700"/>
          <rect x="21" y="12" width="8" height="1" fill="#FFD700"/>
          <rect x="22" y="14" width="6" height="1" fill="#4169E1"/>
          <!-- Wing tips -->
          <rect x="0" y="12" width="4" height="6" fill="#4B0082"/>
          <rect x="28" y="12" width="4" height="6" fill="#4B0082"/>
          <!-- Tail feathers (spread) -->
          <rect x="17" y="22" width="2" height="4" fill="#800080"/>
          <rect x="15" y="24" width="2" height="3" fill="#FFD700"/>
          <rect x="19" y="24" width="2" height="3" fill="#FFD700"/>
          <!-- Legs (tucked for flight) -->
          <rect x="15" y="22" width="2" height="2" fill="#FFD700"/>
          <rect x="17" y="22" width="2" height="2" fill="#FFD700"/>
          <!-- Majestic aura trail -->
          <rect x="0" y="10" width="1" height="1" fill="#FFD700"/>
          <rect x="31" y="12" width="1" height="1" fill="#4169E1"/>
          <rect x="2" y="6" width="1" height="1" fill="#800080"/>
          <rect x="29" y="8" width="1" height="1" fill="#FFD700"/>
          <rect x="4" y="4" width="1" height="1" fill="#FFFFFF"/>
          <rect x="27" y="6" width="1" height="1" fill="#FFFFFF"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="13" y="16" width="8" height="8" fill="#800080"/>
          <!-- Head -->
          <rect x="15" y="8" width="4" height="8" fill="#FFFFFF"/>
          <!-- Royal crown -->
          <rect x="14" y="6" width="6" height="2" fill="#FFD700"/>
          <rect x="15" y="4" width="1" height="2" fill="#FFD700"/>
          <rect x="17" y="4" width="1" height="2" fill="#FFD700"/>
          <rect x="19" y="4" width="1" height="2" fill="#FFD700"/>
          <!-- Crown jewels -->
          <rect x="15" y="5" width="1" height="1" fill="#FF0000"/>
          <rect x="17" y="5" width="1" height="1" fill="#0000FF"/>
          <rect x="19" y="5" width="1" height="1" fill="#00FF00"/>
          <!-- Beak -->
          <rect x="13" y="12" width="2" height="2" fill="#FFD700"/>
          <!-- Eyes -->
          <rect x="16" y="10" width="2" height="2" fill="#4169E1"/>
          <!-- Wings (landing position) -->
          <rect x="5" y="12" width="8" height="8" fill="#800080"/>
          <rect x="19" y="12" width="8" height="8" fill="#800080"/>
          <!-- Wing patterns -->
          <rect x="6" y="14" width="6" height="1" fill="#FFD700"/>
          <rect x="7" y="16" width="4" height="1" fill="#FFD700"/>
          <rect x="20" y="14" width="6" height="1" fill="#FFD700"/>
          <rect x="21" y="16" width="4" height="1" fill="#FFD700"/>
          <!-- Wing tips -->
          <rect x="3" y="14" width="4" height="6" fill="#4B0082"/>
          <rect x="25" y="14" width="4" height="6" fill="#4B0082"/>
          <!-- Tail feathers -->
          <rect x="17" y="24" width="2" height="4" fill="#800080"/>
          <rect x="15" y="26" width="2" height="2" fill="#FFD700"/>
          <rect x="19" y="26" width="2" height="2" fill="#FFD700"/>
          <!-- Legs (landing) -->
          <rect x="14" y="24" width="2" height="4" fill="#FFD700"/>
          <rect x="16" y="24" width="2" height="4" fill="#FFD700"/>
          <!-- Talons -->
          <rect x="13" y="28" width="3" height="1" fill="#FFD700"/>
          <rect x="16" y="28" width="3" height="1" fill="#FFD700"/>
          <!-- Royal aura -->
          <rect x="3" y="10" width="1" height="1" fill="#FFD700"/>
          <rect x="28" y="12" width="1" height="1" fill="#4169E1"/>
          <rect x="6" y="8" width="1" height="1" fill="#800080"/>
          <rect x="25" y="10" width="1" height="1" fill="#FFD700"/>
        </svg>
      `)
    ],
    name: 'Royal Griffin'
  },
  // Diamond Dog - Rare pet with diamond decorations
  '💎': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="8" fill="#C0C0C0"/>
          <!-- Head -->
          <rect x="12" y="8" width="8" height="8" fill="#C0C0C0"/>
          <!-- Snout -->
          <rect x="8" y="12" width="4" height="4" fill="#C0C0C0"/>
          <!-- Ears -->
          <rect x="12" y="6" width="3" height="4" fill="#C0C0C0"/>
          <rect x="17" y="6" width="3" height="4" fill="#C0C0C0"/>
          <!-- Eyes -->
          <rect x="13" y="10" width="2" height="2" fill="#00FFFF"/>
          <rect x="17" y="10" width="2" height="2" fill="#00FFFF"/>
          <!-- Nose -->
          <rect x="9" y="13" width="2" height="2" fill="#000000"/>
          <!-- Diamond collar -->
          <rect x="11" y="15" width="10" height="2" fill="#FFD700"/>
          <rect x="13" y="14" width="2" height="1" fill="#00FFFF"/>
          <rect x="17" y="14" width="2" height="1" fill="#00FFFF"/>
          <!-- Arms -->
          <rect x="8" y="18" width="3" height="4" fill="#C0C0C0"/>
          <rect x="21" y="18" width="3" height="4" fill="#C0C0C0"/>
          <!-- Legs -->
          <rect x="12" y="24" width="3" height="4" fill="#C0C0C0"/>
          <rect x="17" y="24" width="3" height="4" fill="#C0C0C0"/>
          <!-- Tail with diamond tip -->
          <rect x="22" y="18" width="2" height="6" fill="#C0C0C0"/>
          <rect x="24" y="20" width="2" height="2" fill="#00FFFF"/>
          <!-- Diamond markings -->
          <rect x="14" y="18" width="1" height="1" fill="#00FFFF"/>
          <rect x="17" y="18" width="1" height="1" fill="#00FFFF"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="8" fill="#C0C0C0"/>
          <!-- Head -->
          <rect x="12" y="7" width="8" height="8" fill="#C0C0C0"/>
          <!-- Snout -->
          <rect x="8" y="11" width="4" height="4" fill="#C0C0C0"/>
          <!-- Ears -->
          <rect x="12" y="5" width="3" height="4" fill="#C0C0C0"/>
          <rect x="17" y="5" width="3" height="4" fill="#C0C0C0"/>
          <!-- Eyes (sparkling) -->
          <rect x="13" y="9" width="2" height="2" fill="#00FFFF"/>
          <rect x="17" y="9" width="2" height="2" fill="#00FFFF"/>
          <rect x="12" y="8" width="1" height="1" fill="#FFFFFF"/>
          <rect x="19" y="8" width="1" height="1" fill="#FFFFFF"/>
          <!-- Nose -->
          <rect x="9" y="12" width="2" height="2" fill="#000000"/>
          <!-- Diamond collar -->
          <rect x="11" y="14" width="10" height="2" fill="#FFD700"/>
          <rect x="13" y="13" width="2" height="1" fill="#00FFFF"/>
          <rect x="17" y="13" width="2" height="1" fill="#00FFFF"/>
          <!-- Arms -->
          <rect x="8" y="17" width="3" height="4" fill="#C0C0C0"/>
          <rect x="21" y="17" width="3" height="4" fill="#C0C0C0"/>
          <!-- Legs -->
          <rect x="12" y="23" width="3" height="4" fill="#C0C0C0"/>
          <rect x="17" y="23" width="3" height="4" fill="#C0C0C0"/>
          <!-- Tail with diamond tip -->
          <rect x="22" y="17" width="2" height="6" fill="#C0C0C0"/>
          <rect x="24" y="19" width="2" height="2" fill="#00FFFF"/>
          <!-- Diamond markings -->
          <rect x="14" y="17" width="1" height="1" fill="#00FFFF"/>
          <rect x="17" y="17" width="1" height="1" fill="#00FFFF"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#C0C0C0"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#C0C0C0"/>
          <!-- Snout -->
          <rect x="9" y="12" width="4" height="4" fill="#C0C0C0"/>
          <!-- Ears -->
          <rect x="13" y="6" width="3" height="4" fill="#C0C0C0"/>
          <rect x="18" y="6" width="3" height="4" fill="#C0C0C0"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#00FFFF"/>
          <rect x="18" y="10" width="2" height="2" fill="#00FFFF"/>
          <!-- Nose -->
          <rect x="10" y="13" width="2" height="2" fill="#000000"/>
          <!-- Diamond collar -->
          <rect x="12" y="15" width="10" height="2" fill="#FFD700"/>
          <rect x="14" y="14" width="2" height="1" fill="#00FFFF"/>
          <rect x="18" y="14" width="2" height="1" fill="#00FFFF"/>
          <!-- Arms (running) -->
          <rect x="7" y="17" width="4" height="5" fill="#C0C0C0"/>
          <rect x="21" y="19" width="4" height="3" fill="#C0C0C0"/>
          <!-- Legs (running) -->
          <rect x="11" y="24" width="3" height="4" fill="#C0C0C0"/>
          <rect x="18" y="24" width="3" height="4" fill="#C0C0C0"/>
          <!-- Tail (wagging) -->
          <rect x="23" y="17" width="2" height="7" fill="#C0C0C0"/>
          <rect x="25" y="19" width="2" height="3" fill="#00FFFF"/>
          <!-- Diamond trail effect -->
          <rect x="6" y="20" width="1" height="1" fill="#00FFFF"/>
          <rect x="8" y="22" width="1" height="1" fill="#00FFFF"/>
          <rect x="26" y="18" width="1" height="1" fill="#00FFFF"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#C0C0C0"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#C0C0C0"/>
          <!-- Snout -->
          <rect x="9" y="12" width="4" height="4" fill="#C0C0C0"/>
          <!-- Ears -->
          <rect x="13" y="6" width="3" height="4" fill="#C0C0C0"/>
          <rect x="18" y="6" width="3" height="4" fill="#C0C0C0"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#00FFFF"/>
          <rect x="18" y="10" width="2" height="2" fill="#00FFFF"/>
          <!-- Nose -->
          <rect x="10" y="13" width="2" height="2" fill="#000000"/>
          <!-- Diamond collar -->
          <rect x="12" y="15" width="10" height="2" fill="#FFD700"/>
          <rect x="14" y="14" width="2" height="1" fill="#00FFFF"/>
          <rect x="18" y="14" width="2" height="1" fill="#00FFFF"/>
          <!-- Arms (running) -->
          <rect x="9" y="19" width="4" height="3" fill="#C0C0C0"/>
          <rect x="23" y="17" width="4" height="5" fill="#C0C0C0"/>
          <!-- Legs (running) -->
          <rect x="13" y="24" width="3" height="4" fill="#C0C0C0"/>
          <rect x="16" y="24" width="3" height="4" fill="#C0C0C0"/>
          <!-- Tail (wagging) -->
          <rect x="21" y="17" width="2" height="7" fill="#C0C0C0"/>
          <rect x="19" y="19" width="2" height="3" fill="#00FFFF"/>
          <!-- Diamond trail effect -->
          <rect x="7" y="18" width="1" height="1" fill="#00FFFF"/>
          <rect x="25" y="20" width="1" height="1" fill="#00FFFF"/>
          <rect x="27" y="16" width="1" height="1" fill="#00FFFF"/>
        </svg>
      `)
    ],
    name: 'Diamond Dog'
  },
  // Lucky Dragon - Rare pet with magical aura
  '🐉': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="8" fill="#00FF00"/>
          <!-- Head -->
          <rect x="12" y="8" width="8" height="8" fill="#00FF00"/>
          <!-- Snout -->
          <rect x="8" y="12" width="4" height="4" fill="#00FF00"/>
          <!-- Eyes (magical) -->
          <rect x="13" y="10" width="2" height="2" fill="#FFD700"/>
          <rect x="17" y="10" width="2" height="2" fill="#FFD700"/>
          <!-- Nostrils -->
          <rect x="9" y="13" width="1" height="1" fill="#000000"/>
          <rect x="10" y="13" width="1" height="1" fill="#000000"/>
          <!-- Wings -->
          <rect x="6" y="14" width="6" height="8" fill="#32CD32"/>
          <rect x="20" y="14" width="6" height="8" fill="#32CD32"/>
          <!-- Wing details -->
          <rect x="7" y="16" width="4" height="4" fill="#7CFC00"/>
          <rect x="21" y="16" width="4" height="4" fill="#7CFC00"/>
          <!-- Legs -->
          <rect x="12" y="24" width="3" height="4" fill="#00FF00"/>
          <rect x="17" y="24" width="3" height="4" fill="#00FF00"/>
          <!-- Tail -->
          <rect x="22" y="20" width="4" height="2" fill="#00FF00"/>
          <rect x="24" y="18" width="2" height="2" fill="#00FF00"/>
          <!-- Lucky clover markings -->
          <rect x="14" y="18" width="2" height="2" fill="#7CFC00"/>
          <rect x="13" y="19" width="1" height="1" fill="#228B22"/>
          <rect x="15" y="19" width="1" height="1" fill="#228B22"/>
          <rect x="14" y="20" width="1" height="1" fill="#228B22"/>
          <rect x="16" y="18" width="2" height="2" fill="#7CFC00"/>
          <rect x="15" y="19" width="1" height="1" fill="#228B22"/>
          <rect x="17" y="19" width="1" height="1" fill="#228B22"/>
          <rect x="16" y="20" width="1" height="1" fill="#228B22"/>
          <!-- Lucky aura -->
          <rect x="6" y="6" width="1" height="1" fill="#FFD700"/>
          <rect x="25" y="8" width="1" height="1" fill="#FFD700"/>
          <rect x="4" y="12" width="1" height="1" fill="#FFD700"/>
          <rect x="27" y="14" width="1" height="1" fill="#FFD700"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="8" fill="#00FF00"/>
          <!-- Head -->
          <rect x="12" y="7" width="8" height="8" fill="#00FF00"/>
          <!-- Snout -->
          <rect x="8" y="11" width="4" height="4" fill="#00FF00"/>
          <!-- Eyes (glowing) -->
          <rect x="13" y="9" width="2" height="2" fill="#FFD700"/>
          <rect x="17" y="9" width="2" height="2" fill="#FFD700"/>
          <rect x="12" y="8" width="1" height="1" fill="#FFFF00"/>
          <rect x="19" y="8" width="1" height="1" fill="#FFFF00"/>
          <!-- Nostrils -->
          <rect x="9" y="12" width="1" height="1" fill="#000000"/>
          <rect x="10" y="12" width="1" height="1" fill="#000000"/>
          <!-- Wings (slight flap) -->
          <rect x="5" y="12" width="7" height="9" fill="#32CD32"/>
          <rect x="20" y="12" width="7" height="9" fill="#32CD32"/>
          <!-- Wing details -->
          <rect x="6" y="14" width="5" height="5" fill="#7CFC00"/>
          <rect x="21" y="14" width="5" height="5" fill="#7CFC00"/>
          <!-- Legs -->
          <rect x="12" y="23" width="3" height="4" fill="#00FF00"/>
          <rect x="17" y="23" width="3" height="4" fill="#00FF00"/>
          <!-- Tail -->
          <rect x="22" y="19" width="4" height="2" fill="#00FF00"/>
          <rect x="24" y="17" width="2" height="2" fill="#00FF00"/>
          <!-- Lucky clover markings -->
          <rect x="14" y="17" width="2" height="2" fill="#7CFC00"/>
          <rect x="16" y="17" width="2" height="2" fill="#7CFC00"/>
          <!-- Lucky aura (animated) -->
          <rect x="5" y="5" width="1" height="1" fill="#FFD700"/>
          <rect x="26" y="7" width="1" height="1" fill="#FFD700"/>
          <rect x="3" y="11" width="1" height="1" fill="#FFD700"/>
          <rect x="28" y="13" width="1" height="1" fill="#FFD700"/>
          <rect x="7" y="4" width="1" height="1" fill="#FFFF00"/>
          <rect x="24" y="6" width="1" height="1" fill="#FFFF00"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#00FF00"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#00FF00"/>
          <!-- Snout -->
          <rect x="9" y="12" width="4" height="4" fill="#00FF00"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#FFD700"/>
          <rect x="18" y="10" width="2" height="2" fill="#FFD700"/>
          <!-- Nostrils with lucky sparkles -->
          <rect x="6" y="13" width="3" height="1" fill="#FFD700"/>
          <rect x="5" y="14" width="2" height="1" fill="#7CFC00"/>
          <!-- Wings (extended flying) -->
          <rect x="3" y="10" width="9" height="10" fill="#32CD32"/>
          <rect x="20" y="10" width="9" height="10" fill="#32CD32"/>
          <!-- Wing details -->
          <rect x="4" y="12" width="7" height="6" fill="#7CFC00"/>
          <rect x="21" y="12" width="7" height="6" fill="#7CFC00"/>
          <!-- Legs (flying position) -->
          <rect x="11" y="24" width="3" height="4" fill="#00FF00"/>
          <rect x="18" y="24" width="3" height="4" fill="#00FF00"/>
          <!-- Tail -->
          <rect x="23" y="20" width="4" height="2" fill="#00FF00"/>
          <rect x="25" y="18" width="2" height="2" fill="#00FF00"/>
          <!-- Lucky trail -->
          <rect x="5" y="18" width="2" height="2" fill="#7CFC00"/>
          <rect x="4" y="19" width="1" height="1" fill="#228B22"/>
          <rect x="6" y="19" width="1" height="1" fill="#228B22"/>
          <rect x="5" y="20" width="1" height="1" fill="#228B22"/>
          <!-- Lucky aura trail -->
          <rect x="2" y="12" width="1" height="1" fill="#FFD700"/>
          <rect x="1" y="16" width="1" height="1" fill="#FFD700"/>
          <rect x="30" y="14" width="1" height="1" fill="#FFD700"/>
          <rect x="29" y="18" width="1" height="1" fill="#FFD700"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="8" fill="#00FF00"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#00FF00"/>
          <!-- Snout -->
          <rect x="9" y="12" width="4" height="4" fill="#00FF00"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#FFD700"/>
          <rect x="18" y="10" width="2" height="2" fill="#FFD700"/>
          <!-- Nostrils -->
          <rect x="10" y="13" width="1" height="1" fill="#000000"/>
          <rect x="11" y="13" width="1" height="1" fill="#000000"/>
          <!-- Wings (folded back) -->
          <rect x="4" y="12" width="8" height="9" fill="#32CD32"/>
          <rect x="20" y="12" width="8" height="9" fill="#32CD32"/>
          <!-- Wing details -->
          <rect x="5" y="14" width="6" height="5" fill="#7CFC00"/>
          <rect x="21" y="14" width="6" height="5" fill="#7CFC00"/>
          <!-- Legs (walking) -->
          <rect x="13" y="24" width="3" height="4" fill="#00FF00"/>
          <rect x="16" y="24" width="3" height="4" fill="#00FF00"/>
          <!-- Tail -->
          <rect x="23" y="20" width="4" height="2" fill="#00FF00"/>
          <rect x="25" y="18" width="2" height="2" fill="#00FF00"/>
          <!-- Lucky clover markings -->
          <rect x="14" y="18" width="2" height="2" fill="#7CFC00"/>
          <rect x="16" y="18" width="2" height="2" fill="#7CFC00"/>
          <!-- Lucky aura -->
          <rect x="3" y="10" width="1" height="1" fill="#FFD700"/>
          <rect x="28" y="12" width="1" height="1" fill="#FFD700"/>
          <rect x="6" y="8" width="1" height="1" fill="#FFD700"/>
          <rect x="25" y="16" width="1" height="1" fill="#FFD700"/>
        </svg>
      `)
    ],
    name: 'Lucky Dragon'
  },
  // Phoenix Chick - Rare pet with fire effects
  '🔥': {
    idle: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="16" width="12" height="10" fill="#FF4500"/>
          <!-- Head -->
          <rect x="12" y="8" width="8" height="8" fill="#FF6347"/>
          <!-- Flame crest -->
          <rect x="14" y="4" width="2" height="4" fill="#FF0000"/>
          <rect x="16" y="4" width="2" height="4" fill="#FF4500"/>
          <rect x="13" y="2" width="1" height="2" fill="#FFFF00"/>
          <rect x="17" y="2" width="1" height="2" fill="#FFFF00"/>
          <!-- Beak -->
          <rect x="14" y="12" width="4" height="2" fill="#FFD700"/>
          <!-- Eyes (fiery) -->
          <rect x="13" y="10" width="2" height="2" fill="#FF0000"/>
          <rect x="17" y="10" width="2" height="2" fill="#FF0000"/>
          <rect x="13" y="10" width="1" height="1" fill="#FFFF00"/>
          <rect x="17" y="10" width="1" height="1" fill="#FFFF00"/>
          <!-- Wings (flame-like) -->
          <rect x="8" y="18" width="4" height="6" fill="#FF6347"/>
          <rect x="20" y="18" width="4" height="6" fill="#FF6347"/>
          <rect x="6" y="19" width="2" height="4" fill="#FF4500"/>
          <rect x="24" y="19" width="2" height="4" fill="#FF4500"/>
          <rect x="5" y="20" width="1" height="2" fill="#FF0000"/>
          <rect x="26" y="20" width="1" height="2" fill="#FF0000"/>
          <!-- Feet -->
          <rect x="12" y="26" width="3" height="3" fill="#FFD700"/>
          <rect x="17" y="26" width="3" height="3" fill="#FFD700"/>
          <!-- Fire aura -->
          <rect x="8" y="14" width="1" height="1" fill="#FFFF00"/>
          <rect x="23" y="15" width="1" height="1" fill="#FFFF00"/>
          <rect x="6" y="17" width="1" height="1" fill="#FF0000"/>
          <rect x="25" y="18" width="1" height="1" fill="#FF0000"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="10" y="15" width="12" height="10" fill="#FF4500"/>
          <!-- Head -->
          <rect x="12" y="7" width="8" height="8" fill="#FF6347"/>
          <!-- Flame crest (flickering) -->
          <rect x="14" y="3" width="2" height="4" fill="#FF0000"/>
          <rect x="16" y="3" width="2" height="4" fill="#FF4500"/>
          <rect x="13" y="1" width="1" height="2" fill="#FFFF00"/>
          <rect x="17" y="1" width="1" height="2" fill="#FFFF00"/>
          <rect x="15" y="2" width="2" height="1" fill="#FFFFFF"/>
          <!-- Beak -->
          <rect x="14" y="11" width="4" height="2" fill="#FFD700"/>
          <!-- Eyes (glowing) -->
          <rect x="13" y="9" width="2" height="2" fill="#FF0000"/>
          <rect x="17" y="9" width="2" height="2" fill="#FF0000"/>
          <rect x="14" y="9" width="1" height="1" fill="#FFFF00"/>
          <rect x="18" y="9" width="1" height="1" fill="#FFFF00"/>
          <!-- Wings (flame-like, fluttering) -->
          <rect x="7" y="17" width="5" height="7" fill="#FF6347"/>
          <rect x="20" y="17" width="5" height="7" fill="#FF6347"/>
          <rect x="5" y="18" width="3" height="5" fill="#FF4500"/>
          <rect x="24" y="18" width="3" height="5" fill="#FF4500"/>
          <rect x="4" y="19" width="2" height="3" fill="#FF0000"/>
          <rect x="26" y="19" width="2" height="3" fill="#FF0000"/>
          <!-- Feet -->
          <rect x="12" y="25" width="3" height="3" fill="#FFD700"/>
          <rect x="17" y="25" width="3" height="3" fill="#FFD700"/>
          <!-- Fire aura (animated) -->
          <rect x="7" y="13" width="1" height="1" fill="#FFFF00"/>
          <rect x="24" y="14" width="1" height="1" fill="#FFFF00"/>
          <rect x="5" y="16" width="1" height="1" fill="#FF0000"/>
          <rect x="26" y="17" width="1" height="1" fill="#FF0000"/>
          <rect x="9" y="12" width="1" height="1" fill="#FFFFFF"/>
          <rect x="22" y="13" width="1" height="1" fill="#FFFFFF"/>
        </svg>
      `)
    ],
    walking: [
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body (leaning forward) -->
          <rect x="11" y="16" width="12" height="10" fill="#FF4500"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#FF6347"/>
          <!-- Flame crest (intense) -->
          <rect x="15" y="4" width="2" height="4" fill="#FF0000"/>
          <rect x="17" y="4" width="2" height="4" fill="#FF4500"/>
          <rect x="14" y="2" width="1" height="2" fill="#FFFF00"/>
          <rect x="18" y="2" width="1" height="2" fill="#FFFF00"/>
          <rect x="16" y="1" width="2" height="1" fill="#FFFFFF"/>
          <!-- Beak -->
          <rect x="15" y="12" width="4" height="2" fill="#FFD700"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#FF0000"/>
          <rect x="18" y="10" width="2" height="2" fill="#FF0000"/>
          <!-- Wings (spread with fire) -->
          <rect x="5" y="15" width="6" height="8" fill="#FF6347"/>
          <rect x="21" y="15" width="6" height="8" fill="#FF6347"/>
          <rect x="3" y="16" width="4" height="6" fill="#FF4500"/>
          <rect x="25" y="16" width="4" height="6" fill="#FF4500"/>
          <rect x="1" y="17" width="3" height="4" fill="#FF0000"/>
          <rect x="28" y="17" width="3" height="4" fill="#FF0000"/>
          <!-- Feet (running) -->
          <rect x="10" y="26" width="3" height="3" fill="#FFD700"/>
          <rect x="18" y="26" width="3" height="3" fill="#FFD700"/>
          <!-- Fire trail -->
          <rect x="6" y="20" width="2" height="2" fill="#FF4500"/>
          <rect x="4" y="22" width="2" height="2" fill="#FF0000"/>
          <rect x="2" y="24" width="2" height="2" fill="#FFFF00"/>
          <!-- Intense fire aura -->
          <rect x="0" y="14" width="1" height="1" fill="#FFFF00"/>
          <rect x="31" y="16" width="1" height="1" fill="#FFFF00"/>
          <rect x="2" y="12" width="1" height="1" fill="#FF0000"/>
          <rect x="29" y="14" width="1" height="1" fill="#FF0000"/>
          <rect x="4" y="10" width="1" height="1" fill="#FFFFFF"/>
          <rect x="27" y="12" width="1" height="1" fill="#FFFFFF"/>
        </svg>
      `),
      'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="11" y="16" width="12" height="10" fill="#FF4500"/>
          <!-- Head -->
          <rect x="13" y="8" width="8" height="8" fill="#FF6347"/>
          <!-- Flame crest -->
          <rect x="15" y="4" width="2" height="4" fill="#FF0000"/>
          <rect x="17" y="4" width="2" height="4" fill="#FF4500"/>
          <rect x="14" y="2" width="1" height="2" fill="#FFFF00"/>
          <rect x="18" y="2" width="1" height="2" fill="#FFFF00"/>
          <!-- Beak -->
          <rect x="15" y="12" width="4" height="2" fill="#FFD700"/>
          <!-- Eyes -->
          <rect x="14" y="10" width="2" height="2" fill="#FF0000"/>
          <rect x="18" y="10" width="2" height="2" fill="#FF0000"/>
          <!-- Wings (folded with fire glow) -->
          <rect x="7" y="17" width="5" height="7" fill="#FF6347"/>
          <rect x="20" y="17" width="5" height="7" fill="#FF6347"/>
          <rect x="6" y="18" width="3" height="5" fill="#FF4500"/>
          <rect x="23" y="18" width="3" height="5" fill="#FF4500"/>
          <!-- Feet (walking) -->
          <rect x="13" y="26" width="3" height="3" fill="#FFD700"/>
          <rect x="16" y="26" width="3" height="3" fill="#FFD700"/>
          <!-- Fire aura -->
          <rect x="5" y="15" width="1" height="1" fill="#FFFF00"/>
          <rect x="26" y="16" width="1" height="1" fill="#FFFF00"/>
          <rect x="8" y="13" width="1" height="1" fill="#FF0000"/>
          <rect x="23" y="14" width="1" height="1" fill="#FF0000"/>
          <rect x="10" y="11" width="1" height="1" fill="#FFFFFF"/>
          <rect x="21" y="12" width="1" height="1" fill="#FFFFFF"/>
        </svg>
      `)
    ],
    name: 'Phoenix Chick'
  }
};

// Pokemon-style pixel garden background component
interface PixelGardenProps {
  children: React.ReactNode;
  onGardenClick: (x: number, y: number) => void;
}

const PixelGarden = ({ children, onGardenClick }: PixelGardenProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.imageSmoothingEnabled = false;
    
    // Pokemon-style pixelated grass pattern
    const drawGrassPattern = () => {
      // Base grass layer
      ctx.fillStyle = '#4A9749';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Grass texture
      for (let x = 0; x < canvas.width; x += 16) {
        for (let y = 0; y < canvas.height; y += 16) {
          if (Math.random() > 0.7) {
            ctx.fillStyle = '#5BB55A';
            ctx.fillRect(x, y, 8, 8);
          }
          if (Math.random() > 0.8) {
            ctx.fillStyle = '#6AC66A';
            ctx.fillRect(x + 8, y + 8, 8, 8);
          }
        }
      }
      
      // Add some flowers
      ctx.fillStyle = '#FF6B9D';
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * (canvas.width - 16);
        const y = Math.random() * (canvas.height - 16);
        ctx.fillRect(x, y, 8, 8);
        ctx.fillStyle = '#FFEB3B';
        ctx.fillRect(x + 2, y + 2, 4, 4);
        ctx.fillStyle = '#FF6B9D';
      }
      
      // Add trees
      ctx.fillStyle = '#8B4513';
      // Tree trunks
      ctx.fillRect(50, canvas.height - 80, 16, 32);
      ctx.fillRect(canvas.width - 80, canvas.height - 80, 16, 32);
      
      // Tree tops
      ctx.fillStyle = '#228B22';
      ctx.fillRect(34, canvas.height - 96, 48, 48);
      ctx.fillRect(canvas.width - 96, canvas.height - 96, 48, 48);
      
      // Darker green spots on trees
      ctx.fillStyle = '#006400';
      ctx.fillRect(42, canvas.height - 88, 16, 16);
      ctx.fillRect(50, canvas.height - 72, 16, 16);
      ctx.fillRect(canvas.width - 88, canvas.height - 88, 16, 16);
      ctx.fillRect(canvas.width - 80, canvas.height - 72, 16, 16);
      
      // Add a small pond
      ctx.fillStyle = '#4FC3F7';
      ctx.fillRect(canvas.width/2 - 40, canvas.height/2 - 20, 80, 40);
      ctx.fillStyle = '#29B6F6';
      ctx.fillRect(canvas.width/2 - 32, canvas.height/2 - 12, 64, 24);
      
      // Add path
      ctx.fillStyle = '#D2B48C';
      for (let y = 0; y < canvas.height; y += 16) {
        ctx.fillRect(canvas.width/2 - 24, y, 48, 8);
        if (Math.random() > 0.7) {
          ctx.fillStyle = '#DEB887';
          ctx.fillRect(canvas.width/2 - 16, y, 32, 8);
          ctx.fillStyle = '#D2B48C';
        }
      }
    };
    
    drawGrassPattern();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onGardenClick(x, y);
  };

  return (
    <div 
      className="relative w-full h-96 overflow-hidden rounded-lg cursor-pointer pokemon-garden"
      onClick={handleClick}
    >
      <canvas 
        ref={canvasRef}
        width={600}
        height={384}
        className="absolute inset-0 w-full h-full pixel-perfect"
      />
      {children}
    </div>
  );
};

// Pokemon-style animated pet sprite component
interface PetProps {
  pet: {
    id: string;
    pet_type: {
      sprite_emoji: string;
      name: string;
    };
  };
  position: { x: number; y: number };
  petId: string;
}

const PokemonPet = ({ pet, position, petId }: PetProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [direction, setDirection] = useState(1);
  const [currentPosition, setCurrentPosition] = useState(position);
  
  // Use pet type ID to get correct sprite, fallback to sprite_emoji, then default
  const spriteKey = petIdToSpriteMap[pet.pet_type.id?.toString()] || pet.pet_type.sprite_emoji || '🐣';
  const sprite = pokemonPetSprites[spriteKey] || pokemonPetSprites['🐣'];
  
  // Position animation with Pokemon-style movement
  const [{ x, y }, api] = useSpring(() => ({
    x: position.x,
    y: position.y,
    config: { tension: 120, friction: 14 }
  }));

  // Simple movement logic that actually works
  const moveToNewPosition = useCallback(() => {
    // Always move - no random check
    const currentX = currentPosition.x;
    const currentY = currentPosition.y;
    
    // Generate a new position with guaranteed movement
    const moveDistance = 60 + Math.random() * 80; // 60-140 pixels movement
    const angle = Math.random() * 2 * Math.PI;
    
    let newX = currentX + Math.cos(angle) * moveDistance;
    let newY = currentY + Math.sin(angle) * moveDistance;
    
    // Keep within bounds with simpler collision
    newX = Math.max(60, Math.min(newX, 520));
    newY = Math.max(60, Math.min(newY, 300));
    
    // Simple obstacle avoidance - just move away from obstacles
    if (newX < 120 && newY > 260) newX = 150; // Left tree
    if (newX > 480 && newY > 260) newX = 450; // Right tree
    if (newX > 250 && newX < 350 && newY > 160 && newY < 220) {
      // Pond area - move around it
      if (newX < 300) newX = 220;
      else newX = 380;
    }
    
    // Update stored position
    setCurrentPosition({ x: newX, y: newY });
    
    // Update direction for sprite flipping
    setDirection(newX > currentX ? 1 : -1);
    
    // Start walking animation
    setIsWalking(true);
    
    // Animate to new position
    api.start({ 
      x: newX, 
      y: newY,
      config: { tension: 80, friction: 25 }
    });
    
    // Stop walking after movement completes
    setTimeout(() => setIsWalking(false), 1200);
    
    console.log(`Pet ${petId} moving from (${currentX}, ${currentY}) to (${newX}, ${newY})`);
  }, [currentPosition, api, petId]);

  // Movement interval - guaranteed movement every 2-4 seconds
  useEffect(() => {
    const moveInterval = setInterval(() => {
      moveToNewPosition();
    }, 2000 + Math.random() * 2000); // 2-4 seconds
    
    // Start first movement after a short delay
    const initialTimeout = setTimeout(moveToNewPosition, 500 + Math.random() * 1000);
    
    return () => {
      clearInterval(moveInterval);
      clearTimeout(initialTimeout);
    };
  }, [moveToNewPosition, petId]); // Include moveToNewPosition dependency

  // Sprite animation - faster walking frames for more realistic movement
  useEffect(() => {
    const frameInterval = setInterval(() => {
      const frames = isWalking ? sprite.walking : sprite.idle;
      setCurrentFrame(prev => (prev + 1) % frames.length);
    }, isWalking ? 150 : 1000); // Faster walking animation, slower idle

    return () => clearInterval(frameInterval);
  }, [isWalking, sprite]);

  const currentSprite = isWalking ? sprite.walking[currentFrame] : sprite.idle[currentFrame];

  return (
    <animated.div
      className="absolute z-20 select-none pokemon-sprite"
      style={{
        x,
        y,
        transform: direction < 0 ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      <div className="relative">
        <img 
          src={currentSprite}
          alt={sprite.name}
          className="w-12 h-12 pixel-perfect pokemon-pet-sprite"
          style={{ 
            imageRendering: 'pixelated',
            filter: 'none'
          }}
        />
        
        {/* Pokemon-style nameplate */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white text-xs px-2 py-1 rounded border-2 border-blue-600 pokemon-nameplate whitespace-nowrap">
          {sprite.name}
        </div>
        
        {/* Movement indicator */}
        {isWalking && (
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse pokemon-indicator"></div>
        )}
      </div>
    </animated.div>
  );
};

export const PetGarden = () => {
  const { userPets, activePetBoosts, placePetInGarden, removePetFromGarden } = usePetSystem();
  const [selectedPetForPlacement, setSelectedPetForPlacement] = useState<string | null>(null);
  const [petPositions, setPetPositions] = useState<{ [key: string]: { x: number, y: number } }>({});

  const activePets = userPets.filter(pet => pet.is_active);
  const inactivePets = userPets.filter(pet => !pet.is_active);

  // Extract active pet IDs for stable dependency
  const activePetIds = activePets.map(pet => pet.id).join(',');

  // Initialize pet positions only for new pets - stable effect
  useEffect(() => {
    const safePositions = [
      { x: 120, y: 100 }, { x: 220, y: 80 }, { x: 380, y: 120 },
      { x: 150, y: 180 }, { x: 450, y: 160 }, { x: 350, y: 240 },
      { x: 180, y: 260 }, { x: 420, y: 80 }, { x: 480, y: 200 }
    ];
    
    setPetPositions(prev => {
      const newPositions = { ...prev };
      let hasChanges = false;
      
      activePets.forEach((pet, index) => {
        if (!newPositions[pet.id]) {
          const randomOffset = {
            x: (Math.random() - 0.5) * 40, // Random offset to spread them out
            y: (Math.random() - 0.5) * 30
          };
          const basePos = safePositions[index % safePositions.length];
          newPositions[pet.id] = {
            x: basePos.x + randomOffset.x,
            y: basePos.y + randomOffset.y
          };
          hasChanges = true;
          console.log(`Initializing pet ${pet.id} at position:`, newPositions[pet.id]);
        }
      });
      
      return hasChanges ? newPositions : prev;
    });
  }, [activePetIds, activePets]); // Include both dependencies

  const handleGardenClick = useCallback((x: number, y: number) => {
    if (selectedPetForPlacement) {
      // Check if clicked position is valid (not on obstacles)
      if (
        (x < 100 && y > 280) || // Left tree
        (x > 500 && y > 280) || // Right tree
        (x > 260 && x < 340 && y > 172 && y < 212) // Pond
      ) {
        return; // Invalid position
      }
      
      const position = Math.floor(Math.random() * 9);
      placePetInGarden(selectedPetForPlacement, position);
      
      setPetPositions(prev => ({
        ...prev,
        [selectedPetForPlacement]: { x: Math.max(32, Math.min(x, 550)), y: Math.max(32, Math.min(y, 340)) }
      }));
      
      setSelectedPetForPlacement(null);
    }
  }, [selectedPetForPlacement, placePetInGarden]);

  const handleRemovePet = useCallback((petId: string) => {
    removePetFromGarden(petId);
    setPetPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[petId];
      return newPositions;
    });
  }, [removePetFromGarden]);

  return (
    <div className="space-y-6">
      {/* Active Boosts Display - Pokemon Style */}
      <Card className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 border-2 border-blue-500 pokemon-card">
        <CardHeader>
          <CardTitle className="text-center text-yellow-300 pokemon-title">⚡ Active Pet Powers ⚡</CardTitle>
        </CardHeader>
        <CardContent>
          {activePetBoosts.length === 0 ? (
            <p className="text-center text-blue-200">
              No active powers. Place pets in your garden to activate their abilities!
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activePetBoosts.map((boost) => (
                <div
                  key={boost.trait_type}
                  className="text-center p-3 bg-blue-800/50 rounded-lg border-2 border-yellow-400 pokemon-boost-card"
                >
                  <div className="text-2xl mb-1">
                    {traitIcons[boost.trait_type as keyof typeof traitIcons]}
                  </div>
                  <p className="font-bold text-sm text-yellow-300">
                    {traitNames[boost.trait_type as keyof typeof traitNames]}
                  </p>
                  <p className="text-lg font-bold text-green-400">
                    +{((boost.total_boost - 1) * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pokemon-Style Pixel Garden */}
      <Card className="bg-green-900/80 backdrop-blur-sm border-4 border-green-600 pokemon-garden-card">
        <CardHeader>
          <CardTitle className="text-center text-white drop-shadow-lg pokemon-title">
            🌿 Pokemon Pet Garden 🌿
          </CardTitle>
          {selectedPetForPlacement && (
            <p className="text-center text-yellow-300 text-sm animate-pulse pokemon-instruction">
              Click on the grass to place your pet! Avoid trees and water.
            </p>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <PixelGarden onGardenClick={handleGardenClick}>
            {activePets.map((pet) => (
              petPositions[pet.id] && (
                <PokemonPet
                  key={pet.id}
                  pet={pet}
                  position={petPositions[pet.id]}
                  petId={pet.id}
                />
              )
            ))}
            
            {/* Pokemon-style remove buttons */}
            {activePets.map((pet) => (
              petPositions[pet.id] && (
                <div
                  key={`remove-${pet.id}`}
                  className="absolute z-30 pokemon-remove-btn"
                  style={{
                    left: petPositions[pet.id].x + 25,
                    top: petPositions[pet.id].y - 10
                  }}
                >
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePet(pet.id);
                    }}
                    className="text-xs w-6 h-6 p-0 bg-red-600 hover:bg-red-700 border-2 border-red-400"
                  >
                    ✕
                  </Button>
                </div>
              )
            ))}
          </PixelGarden>
        </CardContent>
      </Card>

      {/* Pokemon-Style Pet Inventory */}
      <Card className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-sm border-4 border-purple-500 pokemon-card">
        <CardHeader>
          <CardTitle className="text-center text-white drop-shadow-lg pokemon-title">
            🏠 Pet Storage Box 🏠
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inactivePets.length === 0 ? (
            <p className="text-center text-purple-200 py-8">
              Storage box is empty! All your pets are active in the garden or you need to hatch more eggs.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactivePets.map((pet) => (
                <Card key={pet.id} className="border-2 border-gray-400 bg-gradient-to-b from-blue-100 to-blue-200 pokemon-pet-card hover:scale-105 transition-transform">
                  <CardContent className="p-4 text-center">
                    <div className="mb-2">
                      <img 
                        src={(pokemonPetSprites[petIdToSpriteMap[pet.pet_type.id?.toString()] || pet.pet_type.sprite_emoji] || pokemonPetSprites['🐣']).idle[0]}
                        alt={(pokemonPetSprites[petIdToSpriteMap[pet.pet_type.id?.toString()] || pet.pet_type.sprite_emoji] || pokemonPetSprites['🐣']).name}
                        className="w-16 h-16 mx-auto pixel-perfect pokemon-inventory-sprite"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                    <h3 className="font-bold mb-2 text-blue-900">
                      {(pokemonPetSprites[petIdToSpriteMap[pet.pet_type.id?.toString()] || pet.pet_type.sprite_emoji] || pokemonPetSprites['🐣']).name}
                    </h3>
                    <Badge className={`mb-2 ${rarityColors[pet.pet_type.rarity as keyof typeof rarityColors]} text-white border-2 border-black`}>
                      {pet.pet_type.rarity.toUpperCase()}
                    </Badge>
                    <div className="mb-3">
                      <p className="text-sm font-bold text-blue-800">
                        {traitIcons[pet.pet_type.trait_type as keyof typeof traitIcons]} {traitNames[pet.pet_type.trait_type as keyof typeof traitNames]}
                      </p>
                      <p className="text-sm font-bold text-green-600">
                        +{((pet.pet_type.trait_value - 1) * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => setSelectedPetForPlacement(
                        selectedPetForPlacement === pet.id ? null : pet.id
                      )}
                      className={`w-full text-xs pokemon-action-btn border-2 ${
                        selectedPetForPlacement === pet.id 
                          ? "bg-orange-600 hover:bg-orange-700 border-orange-400" 
                          : "bg-green-600 hover:bg-green-700 border-green-400"
                      }`}
                    >
                      {selectedPetForPlacement === pet.id 
                        ? "Cancel Selection" 
                        : "Send to Garden"
                      }
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PetGarden;
