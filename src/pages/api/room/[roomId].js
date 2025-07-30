// src/pages/api/room/[roomId].js
export default async function handler(req, res) {
  const { roomId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For demo purposes, we'll simulate room existence
    // In a real application, you'd check a database
    if (!roomId || roomId.length !== 8) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Simulate room data
    const roomData = {
      roomId,
      roomName: `Room ${roomId}`,
      maxUsers: 4,
      currentUsers: 0,
      createdBy: 'demo_user',
      createdAt: new Date().toISOString(),
      isPrivate: true,
      description: 'Demo room for testing'
    };

    res.json(roomData);

  } catch (error) {
    console.error('Room info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
