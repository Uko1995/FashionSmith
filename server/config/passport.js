import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { collections } from "./db.js";
import { ObjectId } from "mongodb";

// Configure Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_REDIRECT_URL ||
        "http://localhost:3000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(
          "🔍 Google Profile Data:",
          JSON.stringify(profile, null, 2)
        );

        // Check if user already exists with this Google ID
        let user = await collections.users.findOne({
          googleId: profile.id,
        });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Check if user exists with same email
        user = await collections.users.findOne({
          email: profile.emails[0].value,
        });

        if (user) {
          // User exists with email, link Google account
          await collections.users.updateOne(
            { _id: user._id },
            {
              $set: {
                googleId: profile.id,
                isVerified: true, // Google accounts are pre-verified
                profileImage: profile.photos[0]?.value || user.profileImage,
                updatedAt: new Date(),
              },
            }
          );

          // Fetch updated user
          user = await collections.users.findOne({ _id: user._id });
          return done(null, user);
        }

        // Create new user
        const newUser = {
          googleId: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          username: profile.displayName,
          password: null, // OAuth users don't need passwords
          profileImage: profile.photos[0]?.value || null,
          role: "user",
          isVerified: true, // Google accounts are pre-verified
          authProvider: "google",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        console.log(
          "📝 Attempting to insert user:",
          JSON.stringify(newUser, null, 2)
        );

        const result = await collections.users.insertOne(newUser);
        const createdUser = await collections.users.findOne({
          _id: result.insertedId,
        });

        return done(null, createdUser);
      } catch (error) {
        console.error("❌ Google OAuth user creation error:", error.message);
        if (error.errInfo && error.errInfo.details) {
          console.error(
            "📋 Validation details:",
            JSON.stringify(error.errInfo.details, null, 2)
          );
        }
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await collections.users.findOne({
      _id: new ObjectId(id),
    });

    // Remove sensitive data
    if (user) {
      const { password, refreshToken, ...userWithoutSensitive } = user;
      done(null, userWithoutSensitive);
    } else {
      done(null, null);
    }
  } catch (error) {
    console.error("Deserialize user error:", error);
    done(error, null);
  }
});

export default passport;
