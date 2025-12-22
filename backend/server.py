import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from livekit import api
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for the frontend URL
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/getToken', methods=['GET'])
def get_token():
    participant_identity = request.args.get('identity')
    participant_name = request.args.get('name')
    job_title = request.args.get('jobTitle', 'Software Engineer')
    years_experience = request.args.get('yearsExperience', '0')
    interview_type = request.args.get('interviewType', 'technical')
    competencies = request.args.get('competencies', '[]')
    
    print(f"DEBUG: Received token request - Identity: {participant_identity}, Type: {interview_type}")

    if not participant_identity or not participant_name:
        return jsonify({"error": "Missing identity or name"}), 400

    # Create metadata JSON
    metadata = json.dumps({
        "jobTitle": job_title,
        "yearsExperience": years_experience,
        "competencies": json.loads(competencies) if competencies else [],
        "interviewType": interview_type
    })

    # Create a LiveKit Access Token
    token = api.AccessToken(
        os.getenv('LIVEKIT_API_KEY'),
        os.getenv('LIVEKIT_API_SECRET')
    )
    
    # Set permissions: user can subscribe to the room and publish their own naming
    token.with_identity(participant_identity) \
        .with_name(participant_name) \
        .with_metadata(metadata) \
        .with_grants(api.VideoGrants(
            room_join=True,
            room="interview-room-1", # Fixed room for demo, can be dynamic
            can_publish=True,
            can_subscribe=True,
            can_publish_data=True,
        ))

    return jsonify({"token": token.to_jwt()})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"Starting Token Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
