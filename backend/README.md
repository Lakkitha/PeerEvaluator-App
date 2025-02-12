# PeerEvaluator Backend API

## Overview
Backend service for the PeerEvaluator application, built with FastAPI and Firebase. Handles speech analysis, user authentication, and data storage.

## Tech Stack
- FastAPI
- Firebase (Authentication & Storage)
- Python 3.9+
- Docker

## Features
- Speech analysis using Whisper model
- User authentication with Firebase
- Real-time data storage
- Secure file uploads
- RESTful API endpoints

## Setup

### Prerequisites
- Python 3.9+
- Firebase account and credentials
- Docker (optional)

### Environment Setup
1. Create a `.env` file:
```bash
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id