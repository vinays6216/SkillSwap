const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

// Models
const User = require("./models/User");
const Course = require("./models/Course");
const CourseProgress = require("./models/CourseProgress");
const Notification = require("./models/Notification");
const Video = require("./models/Video");
const Message = require("./models/Message");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillswap";

const seedData = async () => {
  try {
    console.log("Connecting to database at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("CONNECTED to MongoDB!");

    // 1. Clear existing database collections
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Course.deleteMany({});
    await CourseProgress.deleteMany({});
    await Notification.deleteMany({});
    await Video.deleteMany({});
    await Message.deleteMany({});
    console.log("Database cleared.");

    // 2. Generate standard password hash
    console.log("Generating passwords...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // 3. Create 6 Users with Indian Names
    console.log("Creating Indian users...");
    const usersData = [
      {
        name: "Aarav Mehta",
        email: "aarav@gmail.com",
        password: hashedPassword,
        bio: "Senior Full Stack Engineer passionate about React, Node.js, and scaling web applications.",
        profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
        skillsOffered: ["Development", "JavaScript", "Node.js"],
        skillsWanted: ["Design", "UI/UX"]
      },
      {
        name: "Ananya Iyer",
        email: "ananya@gmail.com",
        password: hashedPassword,
        bio: "Graphic and UI/UX Designer who loves creating beautiful vector assets and interactive mockups in Figma.",
        profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ananya",
        skillsOffered: ["Design", "UI/UX", "Figma"],
        skillsWanted: ["Development", "JavaScript"]
      },
      {
        name: "Rohan Sharma",
        email: "rohan@gmail.com",
        password: hashedPassword,
        bio: "Acoustic guitarist and composer teaching classical guitar styles, chords, and music theory.",
        profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rohan",
        skillsOffered: ["Music", "Guitar", "Singing"],
        skillsWanted: ["Cooking", "Baking"]
      },
      {
        name: "Priyanka Patel",
        email: "priyanka@gmail.com",
        password: hashedPassword,
        bio: "Home chef and culinary content creator specialize in authentic North & South Indian dishes.",
        profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priyanka",
        skillsOffered: ["Cooking", "Indian Cuisine", "Spices"],
        skillsWanted: ["Music", "Guitar"]
      },
      {
        name: "Karan Malhotra",
        email: "karan@gmail.com",
        password: hashedPassword,
        bio: "Language instructor teaching conversational Spanish and Hindi grammar.",
        profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=Karan",
        skillsOffered: ["Languages", "Hindi", "Spanish"],
        skillsWanted: ["Business", "Marketing"]
      },
      {
        name: "Sneha Reddy",
        email: "sneha@gmail.com",
        password: hashedPassword,
        bio: "Marketing strategist with 5+ years of digital advertising and branding experience for early-stage startups.",
        profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha",
        skillsOffered: ["Business", "Marketing", "SEO"],
        skillsWanted: ["Languages", "Spanish"]
      }
    ];

    const users = await User.insertMany(usersData);
    console.log("Users created:", users.map(u => u.name));

    const [aarav, ananya, rohan, priyanka, karan, sneha] = users;

    // 4. Create Courses for each User (with lessons pointing to public stable video streams)
    console.log("Creating classes...");
    const coursesData = [
      {
        title: "Full-Stack Web Development Bootcamp",
        description: "Learn Node.js, Express, and React to build responsive, modern full-stack web applications from scratch.",
        category: "Development",
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop",
        teacher: aarav._id,
        lessons: [
          {
            title: "Introduction to HTML & Node.js Core",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            duration: "8 mins",
            content: "Learn how Node.js runs JS outside of the browser and understand package.json configurations."
          },
          {
            title: "Creating Express REST APIs",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            duration: "12 mins",
            content: "Build routing structures, work with middleware, and retrieve query params."
          }
        ],
        enrollmentCount: 1,
        averageRating: 5
      },
      {
        title: "Mastering UI/UX & Graphic Design",
        description: "Understand Figma layout grids, typography, components, and create stunning visual guides.",
        category: "Design",
        thumbnail: "https://images.unsplash.com/photo-1561070791-26c113006238?w=500&auto=format&fit=crop",
        teacher: ananya._id,
        lessons: [
          {
            title: "Figma Fundamentals & Layout Grids",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            duration: "10 mins",
            content: "Navigate Figma workspace, structure frames, and alignment groups."
          },
          {
            title: "Typography and Color Harmonization",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            duration: "15 mins",
            content: "Design color contrast ratios and set font hierarchies."
          }
        ],
        enrollmentCount: 1,
        averageRating: 5
      },
      {
        title: "Acoustic Guitar for Beginners",
        description: "Master acoustic guitar chords, strumming patterns, and perform your first full song.",
        category: "Music",
        thumbnail: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&auto=format&fit=crop",
        teacher: rohan._id,
        lessons: [
          {
            title: "Guitar Parts & Tuning to Pitch",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            duration: "6 mins",
            content: "Learn to tune guitar strings to standard EADGBE tuning."
          },
          {
            title: "Major & Minor Chords (C, G, D, Am)",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            duration: "9 mins",
            content: "Place your fingers cleanly to produce chords without buzzing."
          }
        ],
        enrollmentCount: 1,
        averageRating: 5
      },
      {
        title: "North & South Indian Culinary Essentials",
        description: "Cook authentic paneer butter masala, spicy sambhar, and learn optimal blend ratios of dry spices.",
        category: "Cooking",
        thumbnail: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop",
        teacher: priyanka._id,
        lessons: [
          {
            title: "Understanding Spices & Tempering",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            duration: "8 mins",
            content: "Sauté cumin, mustard seeds, and curry leaves to release aroma."
          },
          {
            title: "Perfecting Paneer Butter Masala",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            duration: "14 mins",
            content: "Blend cashews, tomatoes, and butter for a velvety consistency."
          }
        ],
        enrollmentCount: 1,
        averageRating: 5
      },
      {
        title: "Conversational Spanish & Hindi Grammar",
        description: "Speak conversational daily phrases in Spanish and master core verbs, vocabulary, and pronouns.",
        category: "Languages",
        thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500&auto=format&fit=crop",
        teacher: karan._id,
        lessons: [
          {
            title: "Greeting & Introductions (Hola & Namaste)",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            duration: "5 mins",
            content: "Master basic greetings and introducing yourself to peers."
          },
          {
            title: "Verb Conjugations: Ser vs Estar",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            duration: "11 mins",
            content: "Differentiate between permanent characteristics and temporary states."
          }
        ],
        enrollmentCount: 1,
        averageRating: 5
      },
      {
        title: "Digital Marketing & Startup Branding",
        description: "Build digital campaigns, write engaging copy, rank on Google using SEO, and configure conversion analytics.",
        category: "Business",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop",
        teacher: sneha._id,
        lessons: [
          {
            title: "Setting Up Google Analytics & Goals",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            duration: "9 mins",
            content: "Create pixel accounts and log user page views."
          },
          {
            title: "On-Page SEO & Keyword Auditing",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            duration: "13 mins",
            content: "Write meta-titles, add tags, and evaluate ranking keywords."
          }
        ],
        enrollmentCount: 1,
        averageRating: 5
      }
    ];

    const courses = await Course.insertMany(coursesData);
    console.log("Courses created:", courses.map(c => c.title));

    const [aaravDev, ananyaDes, rohanMusic, priyankaCook, karanLang, snehaBiz] = courses;

    // 5. Establish Connections and Reciprocal Swap Progress records
    console.log("Building mutual connections, swaps, and notifications...");

    // Update connection lists in User models
    aarav.connections.push(ananya._id);
    ananya.connections.push(aarav._id);
    await aarav.save();
    await ananya.save();

    rohan.connections.push(priyanka._id);
    priyanka.connections.push(rohan._id);
    await rohan.save();
    await priyanka.save();

    karan.connections.push(sneha._id);
    sneha.connections.push(karan._id);
    await karan.save();
    await sneha.save();

    // 6. Set up mutual active enrollments (in-progress CourseProgress)
    const progressList = [
      // Aarav Mehta enrolled in Ananya's Graphic Design (Unlocks watch access)
      {
        user: aarav._id,
        course: ananyaDes._id,
        completedLessons: [],
        progressPercentage: 0,
        status: "in-progress"
      },
      // Ananya Iyer enrolled in Aarav's Development
      {
        user: ananya._id,
        course: aaravDev._id,
        completedLessons: [],
        progressPercentage: 0,
        status: "in-progress"
      },

      // Rohan Sharma enrolled in Priyanka's Cooking
      {
        user: rohan._id,
        course: priyankaCook._id,
        completedLessons: [],
        progressPercentage: 0,
        status: "in-progress"
      },
      // Priyanka Patel enrolled in Rohan's Music
      {
        user: priyanka._id,
        course: rohanMusic._id,
        completedLessons: [],
        progressPercentage: 0,
        status: "in-progress"
      },

      // Karan Malhotra enrolled in Sneha's Business
      {
        user: karan._id,
        course: snehaBiz._id,
        completedLessons: [],
        progressPercentage: 0,
        status: "in-progress"
      },
      // Sneha Reddy enrolled in Karan's Languages
      {
        user: sneha._id,
        course: karanLang._id,
        completedLessons: [],
        progressPercentage: 0,
        status: "in-progress"
      }
    ];

    await CourseProgress.insertMany(progressList);

    // 7. Add Swap Notifications with "accepted" state to represent swap histories
    const notificationsData = [
      {
        sender: aarav._id,
        senderName: aarav.name,
        recipient: ananya._id,
        course: ananyaDes._id,
        skill: ananyaDes.title,
        status: "accepted"
      },
      {
        sender: ananya._id,
        senderName: ananya.name,
        recipient: aarav._id,
        course: aaravDev._id,
        skill: aaravDev.title,
        status: "accepted"
      },

      {
        sender: rohan._id,
        senderName: rohan.name,
        recipient: priyanka._id,
        course: priyankaCook._id,
        skill: priyankaCook.title,
        status: "accepted"
      },
      {
        sender: priyanka._id,
        senderName: priyanka.name,
        recipient: rohan._id,
        course: rohanMusic._id,
        skill: rohanMusic.title,
        status: "accepted"
      },

      {
        sender: karan._id,
        senderName: karan.name,
        recipient: sneha._id,
        course: snehaBiz._id,
        skill: snehaBiz.title,
        status: "accepted"
      },
      {
        sender: sneha._id,
        senderName: sneha.name,
        recipient: karan._id,
        course: karanLang._id,
        skill: karanLang.title,
        status: "accepted"
      }
    ];

    await Notification.insertMany(notificationsData);

    // 8. Add sample chat Messages exchange between the swap partners
    const messagesData = [
      {
        sender: aarav._id,
        recipient: ananya._id,
        text: "Hi Ananya! Thanks for accepting the swap request. Excited to learn UI/UX design rules!"
      },
      {
        sender: ananya._id,
        recipient: aarav._id,
        text: "Hi Aarav! Looking forward to learning web development in return. Let me know when you start watching the first Figma lesson."
      },

      {
        sender: rohan._id,
        recipient: priyanka._id,
        text: "Namaste Priyanka, let's learn acoustic guitar chords! In return, teach me spice ratios for butter masala."
      },
      {
        sender: priyanka._id,
        recipient: rohan._id,
        text: "Hello Rohan! Sure, the first recipe tutorial in the cooking section is ready to watch. Let's do it."
      },

      {
        sender: karan._id,
        recipient: sneha._id,
        text: "Hi Sneha! Ready to practice Spanish verbs. Excited to learn digital marketing analytics as well!"
      },
      {
        sender: sneha._id,
        recipient: karan._id,
        text: "Hey Karan, sounds great. The Analytics setup guides are live. Let's start swapping!"
      }
    ];

    await Message.insertMany(messagesData);
    console.log("Swap history and messages seeded successfully!");

    console.log("\n===========================================");
    console.log("SEEDS POPULATED SUCCESSFULLY!");
    console.log("All accounts have password: password123");
    console.log("User Emails:");
    users.forEach(u => console.log(` - ${u.name}: ${u.email}`));
    console.log("===========================================");

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
