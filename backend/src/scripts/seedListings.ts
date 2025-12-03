import "dotenv/config";
import mongoose from "mongoose";
import { Listing } from "../models/Listing";
import { User } from "../models/User";

async function main() {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/airbnb_clone";

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("✅ Connected");

  // 1) Find an existing host/admin user to own these listings
  const hostUser = await User.findOne({
    role: { $in: ["host", "admin"] },
  }).lean();

  if (!hostUser) {
    console.error(
      "❌ No user with role 'host' or 'admin' found. Please create a user in the app, set its role to 'host' or 'admin' in MongoDB Atlas, and run this script again."
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const hostId = (hostUser as any)._id;
  const hostEmail = (hostUser as any).email;
  console.log(
    `ℹ️ Using existing user as host: ${hostEmail || hostId.toString()}`
  );

  // 2) Example listings data WITH IMAGES
  // 2) Example listings data WITH IMAGES (50 listings)
  const listingsData = [
    // --- Goa / beach ---
    {
      title: "Beachfront studio in North Goa",
      description:
        "Bright studio right on the beach with balcony, hammock and sea breeze all day.",
      location: "Goa, India",
      pricePerNight: 3800,
      maxGuests: 2,
      images: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Palm-view apartment in Candolim",
      description:
        "1BHK apartment with pool access, palm-tree views and a short walk to Candolim beach.",
      location: "Goa, India",
      pricePerNight: 4200,
      maxGuests: 3,
      images: [
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Sunset villa near Anjuna",
      description:
        "Comfortable 2-bedroom villa near Anjuna with terrace seating for perfect sunsets.",
      location: "Goa, India",
      pricePerNight: 5200,
      maxGuests: 4,
      images: [
        "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Budget room close to Baga beach",
      description:
        "Simple private room with AC and Wi-Fi, just a few minutes from Baga beach.",
      location: "Goa, India",
      pricePerNight: 1900,
      maxGuests: 2,
      images: [
        "https://images.unsplash.com/photo-1600585153931-a8f55b8b49d4?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Premium beachfront villa in Morjim",
      description:
        "Spacious villa with private garden, direct beach access and in-house chef on request.",
      location: "Goa, India",
      pricePerNight: 16500,
      maxGuests: 8,
      images: [
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
      ],
    },

    // --- Bangalore / city apartments ---
    {
      title: "Cozy studio in Indiranagar",
      description:
        "Compact studio with balcony, fast Wi-Fi and walking distance to cafés and metro.",
      location: "Bangalore, India",
      pricePerNight: 2600,
      maxGuests: 2,
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Modern 1BHK near Manyata Tech Park",
      description:
        "Airy apartment with workspace and parking, perfect for business travellers.",
      location: "Bangalore, India",
      pricePerNight: 3200,
      maxGuests: 2,
      images: [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Premium 2BHK in Whitefield",
      description:
        "High-floor apartment with city views, gym access and 24x7 security.",
      location: "Bangalore, India",
      pricePerNight: 4800,
      maxGuests: 4,
      images: [
        "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Budget private room near Koramangala",
      description:
        "Private room in shared home, ideal for short stays and work trips.",
      location: "Bangalore, India",
      pricePerNight: 1700,
      maxGuests: 1,
      images: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Family apartment opposite Cubbon Park",
      description:
        "Spacious 3BHK with balcony facing greenery, great for families and long stays.",
      location: "Bangalore, India",
      pricePerNight: 6500,
      maxGuests: 6,
      images: [
        "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80",
      ],
    },

    // --- Hyderabad / tech city ---
    {
      title: "Modern 2BHK in Hitech City",
      description:
        "Close to offices, with strong Wi-Fi, workspace and covered parking.",
      location: "Hyderabad, India",
      pricePerNight: 3400,
      maxGuests: 4,
      images: [
        "https://images.unsplash.com/photo-1600607688969-a5d2c5b92a50?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Studio near Gachibowli",
      description:
        "Comfortable studio with kitchenette and easy access to IT corridor.",
      location: "Hyderabad, India",
      pricePerNight: 2600,
      maxGuests: 2,
      images: [
        "https://images.unsplash.com/photo-1600585154780-0ef3c08c0632?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Penthouse with terrace in Banjara Hills",
      description:
        "Stylish penthouse with a large terrace, perfect for small gatherings.",
      location: "Hyderabad, India",
      pricePerNight: 7800,
      maxGuests: 5,
      images: [
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Budget room near Charminar",
      description:
        "Simple stay inside the old city with easy access to markets and food.",
      location: "Hyderabad, India",
      pricePerNight: 1400,
      maxGuests: 2,
      images: [
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Service apartment in Jubilee Hills",
      description:
        "Fully serviced 1BHK with housekeeping and breakfast available.",
      location: "Hyderabad, India",
      pricePerNight: 5200,
      maxGuests: 3,
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      ],
    },

    // --- Mumbai / big city stays ---
    {
      title: "Sea-facing apartment in Bandra",
      description:
        "Chic 1BHK with balcony overlooking the sea, close to cafes and nightlife.",
      location: "Mumbai, India",
      pricePerNight: 8200,
      maxGuests: 3,
      images: [
        "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Private room near Mumbai airport",
      description:
        "Clean private room in shared apartment, 10 minutes from the airport.",
      location: "Mumbai, India",
      pricePerNight: 2200,
      maxGuests: 1,
      images: [
        "https://images.unsplash.com/photo-1600585153931-a8f55b8b49d4?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Colaba heritage apartment",
      description:
        "Vintage style apartment with high ceilings and historic charm.",
      location: "Mumbai, India",
      pricePerNight: 6900,
      maxGuests: 4,
      images: [
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Budget hostel bed in Andheri",
      description:
        "Bunk bed in modern hostel, ideal for backpackers and short stops.",
      location: "Mumbai, India",
      pricePerNight: 900,
      maxGuests: 1,
      images: [
        "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Family apartment in Powai",
      description:
        "Lake-view 2BHK in Powai with kids-friendly amenities and playground nearby.",
      location: "Mumbai, India",
      pricePerNight: 7200,
      maxGuests: 5,
      images: [
        "https://images.unsplash.com/photo-1512914890250-353c97c9e7e2?auto=format&fit=crop&w=1200&q=80",
      ],
    },

    // --- Manali / mountains ---
    {
      title: "Mountain view cottage in Manali",
      description:
        "Wooden cottage with fireplace, balcony and panoramic Himalayan views.",
      location: "Manali, India",
      pricePerNight: 4200,
      maxGuests: 3,
      images: [
        "https://images.unsplash.com/photo-1542641728-6ca359b085f0?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Riverside homestay near Manali",
      description:
        "Peaceful homestay with river sounds, home cooked food and warm hosts.",
      location: "Manali, India",
      pricePerNight: 3600,
      maxGuests: 4,
      images: [
        "https://images.unsplash.com/photo-1521292270410-a8c53642e9d0?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Workation cabin in Old Manali",
      description:
        "Cabin with solid Wi-Fi, work desk and heater, ideal for long stays.",
      location: "Manali, India",
      pricePerNight: 3900,
      maxGuests: 2,
      images: [
        "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Budget room near Mall Road",
      description:
        "Simple heated room close to restaurants, shops and transport.",
      location: "Manali, India",
      pricePerNight: 1400,
      maxGuests: 2,
      images: [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Luxury chalet with hot tub",
      description:
        "Premium chalet with private hot tub and stunning snow views.",
      location: "Manali, India",
      pricePerNight: 14500,
      maxGuests: 6,
      images: [
        "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1200&q=80",
      ],
    },

    // --- Jaipur / heritage ---
    {
      title: "Haveli-style room in Jaipur",
      description:
        "Heritage room inside a restored haveli with colourful interiors.",
      location: "Jaipur, India",
      pricePerNight: 3200,
      maxGuests: 2,
      images: [
        "https://images.unsplash.com/photo-1548964095-5b16cde3e6c6?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Budget room in Jaipur old city",
      description:
        "Simple, clean room inside the old city. Walk to markets, forts and local food spots.",
      location: "Jaipur, India",
      pricePerNight: 1200,
      maxGuests: 2,
      images: [
        "https://images.unsplash.com/photo-1560067174-89469c83a9de?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Rooftop apartment near Hawa Mahal",
      description:
        "Apartment with private rooftop and views of old Jaipur skyline.",
      location: "Jaipur, India",
      pricePerNight: 2800,
      maxGuests: 3,
      images: [
        "https://images.unsplash.com/photo-1605426279520-3443f89c3709?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Family suite near Amer Fort",
      description:
        "Spacious family room set in a calm neighbourhood near Amer Fort.",
      location: "Jaipur, India",
      pricePerNight: 4100,
      maxGuests: 4,
      images: [
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Designer boutique stay in Jaipur",
      description:
        "Beautifully designed rooms with curated decor and courtyard café.",
      location: "Jaipur, India",
      pricePerNight: 5500,
      maxGuests: 2,
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      ],
    },

    // --- Kerala / backwaters ---
    {
      title: "Houseboat stay in Alleppey",
      description:
        "Traditional Kerala houseboat experience with all meals included.",
      location: "Alleppey, India",
      pricePerNight: 9500,
      maxGuests: 4,
      images: [
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Backwater homestay near Kumarakom",
      description:
        "Stay right by the backwaters with canoe rides and homemade food.",
      location: "Kumarakom, India",
      pricePerNight: 3800,
      maxGuests: 3,
      images: [
        "https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Cliffside room in Varkala",
      description:
        "Room on the cliff with sea view and easy access to the beach.",
      location: "Varkala, India",
      pricePerNight: 2600,
      maxGuests: 2,
      images: [
        "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Tea estate cottage in Munnar",
      description:
        "Cottage surrounded by tea plantations with cool weather and mist.",
      location: "Munnar, India",
      pricePerNight: 4300,
      maxGuests: 3,
      images: [
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Luxury villa with pool in Kochi outskirts",
      description:
        "Private villa with pool and garden, ideal for group getaways.",
      location: "Kochi, India",
      pricePerNight: 12500,
      maxGuests: 8,
      images: [
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
      ],
    },

    // --- Pune / work-friendly ---
    {
      title: "Work-friendly loft in Pune",
      description:
        "Stylish loft with fast Wi-Fi, work desk and great daylight.",
      location: "Pune, India",
      pricePerNight: 3400,
      maxGuests: 2,
      images: [
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Koregaon Park studio",
      description:
        "Studio apartment close to cafés and nightlife in Koregaon Park.",
      location: "Pune, India",
      pricePerNight: 3100,
      maxGuests: 2,
      images: [
        "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Family apartment near Hinjawadi",
      description:
        "2BHK close to IT park with parking and kids-friendly amenities.",
      location: "Pune, India",
      pricePerNight: 4200,
      maxGuests: 4,
      images: [
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Budget room in central Pune",
      description:
        "Clean private room in an older building, walkable to markets.",
      location: "Pune, India",
      pricePerNight: 1300,
      maxGuests: 1,
      images: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Penthouse terrace stay in Pune",
      description:
        "Penthouse with large private terrace and city skyline views.",
      location: "Pune, India",
      pricePerNight: 5400,
      maxGuests: 3,
      images: [
        "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  ];


  // 3) Remove old listings with same titles (avoid duplicates)
  const titles = listingsData.map((l) => l.title);
  console.log("🗑️  Removing existing listings with same titles (if any)...");
  await Listing.deleteMany({ title: { $in: titles } });

  // 4) Attach host id and insert
  const docs = listingsData.map((l) => ({
    ...l,
    host: hostId,
  }));

  console.log("💾 Inserting listings...");
  const created = await Listing.insertMany(docs);

  console.log(`✅ Inserted ${created.length} listings.`);
  console.log("Done.");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed script failed:", err);
  process.exit(1);
});
