import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.mongodb+srv://tejasabhuday:<db_password>@cluster0.vyxkn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0;
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectDB() {
  if (!client.isConnected()) await client.connect();
  return client.db('Cluster0'); 
}

// POST /api/events -> Create a new event
export async function POST(req: Request) {
  const body = await req.json();
  
  const db = await connectDB();
  const eventsCollection = db.collection('events');

  const newEvent = {
    title: body.title,
    description: body.description,
    location: body.location,
    start_date: body.start_date,
    end_date: body.end_date,
    price: body.price,
    is_free: body.is_free,
    category: body.category,
    created_at: new Date(),
  };

  const result = await eventsCollection.insertOne(newEvent);

  return NextResponse.json({ message: 'Event created successfully!', eventId: result.insertedId });
}

// GET /api/events -> Fetch all events
export async function GET() {
  const db = await connectDB();
  const eventsCollection = db.collection('events');

  const events = await eventsCollection.find({}).toArray();

  return NextResponse.json(events);
}
