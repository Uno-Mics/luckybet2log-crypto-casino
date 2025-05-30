
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
  
  const sprite = pokemonPetSprites[pet.pet_type.sprite_emoji] || pokemonPetSprites['🐣'];
  
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
                        src={pokemonPetSprites[pet.pet_type.sprite_emoji]?.idle[0] || pokemonPetSprites['🐣'].idle[0]}
                        alt={pokemonPetSprites[pet.pet_type.sprite_emoji]?.name || 'Pet'}
                        className="w-16 h-16 mx-auto pixel-perfect pokemon-inventory-sprite"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                    <h3 className="font-bold mb-2 text-blue-900">
                      {pokemonPetSprites[pet.pet_type.sprite_emoji]?.name || pet.pet_type.name}
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
