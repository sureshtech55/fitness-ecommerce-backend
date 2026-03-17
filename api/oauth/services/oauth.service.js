const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../user/model/model");

// Configure the Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_CLIENT_SECRET",
      callbackURL: `${process.env.BASE_URL || 'http://localhost:3000'}/api/oauth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user already exists with this googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // 2. Check if user exists with this email (if they registered manually earlier)
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
        
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Link the google account to the existing user
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }
        }

        // 3. If no user exists, create a new one
        const newUser = await User.create({
          name: profile.displayName,
          email: email || `${profile.id}@google.oauth`, // Fallback if email is hidden
          googleId: profile.id,
          // Since password is required by schema but we don't have one, we can either
          // generate a random one or rely on the fact that we might need to modify the 
          // schema to make it conditional. Assuming schema allows it or we generate dummy.
          password: Math.random().toString(36).slice(-10) + "A1!", // Random secure dummy password
          verified: true
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
