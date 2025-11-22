# GNL Admin UI - User Guide

## Table of Contents
1. [Configuration Management](#configuration-management)
2. [Player Management](#player-management)
3. [Season Setup](#season-setup)
4. [Team Management](#team-management)
5. [Match & Series Management](#match--series-management)
6. [Fantasy League Setup](#fantasy-league-setup)

---

## Configuration Management

### Enable/Disable Player Signups

**Navigation:** Configuration → Application Settings

 1. Navigate to **Configuration** in the sidebar
 2. Scroll to **Public Access Settings** section
 3. Toggle **Player Signups Enabled**
   - **ON (green)**: Players can sign up via Discord bot
   - **OFF (gray)**: Signup functionality is disabled
 4. Click **Save Settings** at the bottom

**Use Cases:**
- Enable before season registration period
- Disable after registration deadline
- Disable during off-season

### Configure Discord Bot Settings

**Navigation:** Configuration → Discord Bot Settings

1. Navigate to **Configuration** in the sidebar
2. Scroll to **Discord Bot Settings** section
3. Configure the following Discord Channel IDs:
   - **Captain/Coach Role ID**: Role for team captains
   - **Admin Role ID**: Role for administrators
   - **Signup Channel ID**: Channel where signup button appears
   - **Scheduling Channel ID**: Channel for match scheduling
   - **Results Channel ID**: Channel for match results
   - **Fantasy Dashboard Channel ID**: Channel for fantasy league access
4. Click **Save Settings**

**Finding Discord IDs:**
1. Enable Developer Mode in Discord: Settings → Advanced → Developer Mode
2. Right-click on channel/role → Copy ID

---

## Player Management

### Create a New Player

**Navigation:** Players → Create Player button

1. Navigate to **Players** in the sidebar
2. Click **Create Player** (green plus button in top-right)
3. Fill in player information:
   - **Name**: Player's display name (required)
   - **Discord Tag**: Discord username (optional)
   - **Discord ID**: Numeric Discord user ID (optional)
   - **Battle Tag**: Battle.net tag for W3Champions (optional)
   - **Country**: Player's country (dropdown)
   - **Race**: Primary race (Human/Orc/Night Elf/Undead/Random)
   - **MMR**: Current MMR rating (number)
   - **Fantasy Tier**: Tier for fantasy league (1-6, optional)
4. Click **Save**

**Note:** Discord Tag and ID are automatically populated when players sign up via Discord bot.

### Edit Player Information

**Navigation:** Players → Edit icon on player row

1. Navigate to **Players** in the sidebar
2. Find the player in the list (use search if needed)
3. Click the **pencil icon** in the Actions column
4. Update any fields as needed
5. Click **Save**

**Common Updates:**
- Update MMR after season
- Assign Fantasy Tier (see Fantasy League Setup)
- Update Battle Tag if changed

### Set Player Fantasy Tier

**Navigation:** Players → Edit player

Fantasy tiers are used to balance the fantasy league draft:
- **Tier 1 (Diamond)**: Highest MMR players
- **Tier 2 (Platinum)**: High MMR players
- **Tier 3 (Gold)**: Mid-high MMR players
- **Tier 4 (Silver)**: Mid MMR players
- **Tier 5 (Bronze)**: Low-mid MMR players
- **Tier 6 (Grass)**: Lowest MMR players

1. Navigate to **Players**
2. Click **pencil icon** to edit player
3. Set **Fantasy Tier** dropdown (1-6)
4. Click **Save**

**Tip:** Assign tiers based on MMR distribution to ensure balanced fantasy drafting.

---

## Season Setup

### Create a New Season

**Navigation:** Seasons → Create Season button

1. Navigate to **Seasons** in the sidebar
2. Click **Create Season** (green plus button)
3. Fill in season details:
   - **Name**: Season name (e.g., "GNL Season 16")
   - **Number of Weeks**: Total play weeks (e.g., 7)
   - **Series per Week**: Matches per week per team (e.g., 1)
   - **Is Active**: Toggle if this is the current season
4. Click **Save**

### Set Current Season

**Navigation:** Configuration → GNL League Settings

1. Navigate to **Configuration**
2. In **GNL League Settings**, select season from **Current GNL Season** dropdown
3. Click **Save Settings**

**Important:** The current season is used for:
- Player signups via Discord
- Fantasy team registration
- All active league operations

### Assign Teams to Season

**Navigation:** Teams → Season Assignment

1. Navigate to **Teams** in the sidebar
2. For each team, click **Edit** (pencil icon)
3. In the dialog, go to **Season Assignment** section
4. Check the seasons this team participates in
5. Click **Save**

**Bulk Assignment:**
1. Create all teams first
2. Create the season
3. Edit each team to assign to the new season

---

## Team Management

### Create a New Team

**Navigation:** Teams → Create Team button

1. Navigate to **Teams** in the sidebar
2. Click **Create Team** (green plus button)
3. Fill in team information:
   - **Name**: Team name (required)
   - **Tag**: Short team tag/abbreviation (required)
   - **Country**: Team's country (optional)
4. Click **Save**
5. After creation, edit the team to assign to seasons

### Assign Players to Teams

**Navigation:** Teams → Edit team → Players tab

1. Navigate to **Teams**
2. Click **Edit** (pencil icon) on the team
3. Click **Players** tab in the dialog
4. Use the **Add Players** dropdown to select players
5. Selected players appear as chips
6. Click **X** on chip to remove a player
7. Click **Save**

**Season-Specific Rosters:**
Each team can have different players assigned per season through the season assignment interface.

---

## Match & Series Management

### Create Matches for a Season

**Navigation:** Matches → Create Match button

1. Navigate to **Matches** in the sidebar
2. Click **Create Match** (green plus button)
3. Fill in match details:
   - **Team 1**: First team (dropdown)
   - **Team 2**: Second team (dropdown)
   - **Season**: Select season (dropdown)
   - **Play Day**: Week number (1-7, etc.)
   - **Date Frame**: Week date range (optional, e.g., "Dec 1-7")
4. Click **Save**

**Planning Matches:**
- Create one match per team matchup per play week
- Each match will contain individual player series
- Use Play Day to organize by week

### Create Series within a Match

**Navigation:** Series → Create Series button OR Matches → Series tab

**Method 1: Via Series Page**
1. Navigate to **Series** in the sidebar
2. Click **Create Series** (green plus button)
3. Fill in series details:
   - **Player 1**: First player (dropdown)
   - **Player 2**: Second player (dropdown)
   - **Match**: Parent match (dropdown shows Team1 vs Team2)
   - **Best Of**: Series format (1, 3, or 5)
   - **Is Fantasy Match**: Toggle if this is a fantasy betting match
4. Click **Save**

**Method 2: Via Match Edit Dialog**
1. Navigate to **Matches**
2. Click **Edit** on a match
3. Go to **Series** tab
4. View existing series or create new ones
5. Click **Save**

### Schedule a Series

**Navigation:** Series → Edit series OR Schedule Week view

**Via Series Edit:**
1. Navigate to **Series**
2. Find the series (filter by week if needed)
3. Click **Edit Schedule** icon
4. Set **Date** using date picker
5. Set **Time** using time picker (in your local timezone)
6. Click **Save**

**Via Schedule Week View:**
1. Navigate to **Schedule Week** in sidebar
2. Select **Week Number**
3. Click **Edit** icon on series row
4. Set Date and Time
5. Click **Save**

**Note:** Times are converted to ET (Eastern Time) when saved and displayed in your local timezone.

### Report Series Results

**Navigation:** Series → Report Result OR Schedule Week view

1. Find the series (via **Series** page or **Schedule Week**)
2. Click **Report Result** icon (clipboard with check)
3. In the dialog:
   - Set **Player 1 Score** (0-2 for Bo3, 0-3 for Bo5)
   - Set **Player 2 Score** (0-2 for Bo3, 0-3 for Bo5)
   - Upload **Game 1 Replay** (required)
   - Upload **Game 2 Replay** (required)
   - Upload **Game 3 Replay** (if game 3 was played)
4. Click **Save**

**Replay Files:**
- Must be .w3g files
- Files are uploaded to backend storage
- Used for verification and record-keeping

### Update Series Schedule or Result

**Navigation:** Series → Edit existing series

**To Update Schedule:**
1. Click **Edit Schedule** icon on the series
2. Modify date/time
3. Click **Save**

**To Update Result:**
1. Click **Edit Result** icon on series with results
2. Modify scores or replace replay files
3. Click **Save**

**Bulk Updates:**
Use the **Schedule Week** view to see all series for a specific week and update multiple series efficiently.

---

## Fantasy League Setup

### Enable Fantasy Team Creation

**Navigation:** Configuration → Public Access Settings

1. Navigate to **Configuration**
2. Scroll to **Public Access Settings**
3. Toggle **Fantasy Team Creation Enabled**
   - **ON**: Captains can register fantasy teams
   - **OFF**: Fantasy registration is closed
4. Click **Save Settings**

**Timeline:**
- Enable before fantasy draft period
- Disable after registration deadline
- Can be toggled per season

### Configure Fantasy Betting Settings

**Navigation:** Configuration → Fantasy Betting Settings

1. Navigate to **Configuration**
2. Scroll to **Fantasy Betting Settings**
3. Configure bet points system:

**Option A: Fixed Bet Points**
1. Toggle **Use Fixed Bet Points** to ON
2. Set **Fixed Bet Points Value** (e.g., 100)
3. All bets will use this fixed value

**Option B: Variable Bet Points with Min/Max**
1. Toggle **Use Fixed Bet Points** to OFF
2. Set **Minimum Bet Points** (e.g., 10)
3. Set **Maximum Bet Points** (e.g., 500)
4. Captains choose points within this range

4. Click **Save Settings**

### Assign Player Fantasy Tiers

**Navigation:** Players → Edit player

**Tier Distribution Strategy:**
1. Calculate MMR distribution across all players
2. Divide into 6 equal tiers or by MMR brackets
3. Assign each player to appropriate tier:
   - **Tier 1**: Top ~16% (Diamond)
   - **Tier 2**: Next ~16% (Platinum)
   - **Tier 3**: Next ~17% (Gold)
   - **Tier 4**: Next ~17% (Silver)
   - **Tier 5**: Next ~17% (Bronze)
   - **Tier 6**: Bottom ~17% (Grass)

**To Assign:**
1. Navigate to **Players**
2. Click **Edit** (pencil icon) on each player
3. Set **Fantasy Tier** (1-6)
4. Click **Save**

**Note:** Each fantasy team must draft exactly one player from each tier.

### Mark Series as Fantasy Matches

**Navigation:** Series → Edit series

Fantasy matches are series that captains can bet on:

1. Navigate to **Series**
2. Find series you want to enable for betting
3. Click **Edit** (pencil icon)
4. Toggle **Is Fantasy Match** to ON
5. Click **Save**

**Best Practices:**
- Mark featured/important matches for betting
- Define fantasy matches per week to maintain engagement
- Typically 3-7 fantasy matches per week works well

### Define Fantasy Matches per Week

**Planning Strategy:**

**Weekly Fantasy Match Selection:**
1. Identify high-profile matchups each week
2. Balance across different player tiers
3. Include close skill matchups for interesting betting

**Recommended per Week:**
- **Small League** (8-16 players): 3-4 fantasy matches
- **Medium League** (16-32 players): 5-7 fantasy matches
- **Large League** (32+ players): 7-10 fantasy matches

**To Set Up:**
1. Navigate to **Series**
2. Filter by week number
3. Mark selected series as **Is Fantasy Match**
4. Ensure even distribution across the week

### Create Fantasy Teams (Admin)

**Navigation:** Fantasy → Fantasy Teams → Create Team

Admins can create fantasy teams on behalf of captains:

1. Navigate to **Fantasy** → **Fantasy Teams Leaderboard**
2. Click **Create Team** (green button)
3. Fill in team details:
   - **Team Name**: Fantasy team name
   - **Season**: Select season
   - **Captain**: Select the captain/player
   - **Drafted Team**: GNL team they're drafting
   - **Drafted Race**: Race they're drafting
   - **Drafted Players**: Select 6 players (one from each tier)
4. Click **Create**

**Note:** Captains can also register via Discord bot using `/fantasydashboard` command.

### Manage Fantasy Bets (Admin)

**Navigation:** Fantasy → Fantasy Bets

Admins can create/edit/delete bets on behalf of captains:

**Create Bet:**
1. Navigate to **Fantasy** → **Fantasy Bets**
2. Click **Add Bet** (green button)
3. Fill in:
   - **Season**: Select season
   - **Captain**: Select fantasy team captain
   - **Series**: Select fantasy match
   - **Winner**: Predicted winner
   - **Bet Points**: Points to wager (respects min/max settings)
4. Click **Save**

**Edit Bet:**
1. Find bet in the table
2. Click **Edit** (pencil icon)
3. Modify winner or bet points
4. Click **Save**

**Note:** Bets can only be modified before the series is played.

### Calculate Fantasy Scores

**Navigation:** Fantasy → Fantasy Teams Leaderboard

After matches are completed:

1. Navigate to **Fantasy** → **Fantasy Teams Leaderboard**
2. Select the **Season** from dropdown
3. Click **Calculate Scores** button
4. System calculates:
   - **Player Points**: Points from drafted players' performances
   - **Bench Points**: Points from reserve players
   - **Team Points**: Points from drafted GNL team's performance
   - **Race Points**: Points from drafted race's performance
   - **Bet Points**: Points won/lost from fantasy bets
   - **Total Points**: Sum of all categories
5. Leaderboard updates automatically

**Frequency:**
- Run after each play week completes
- Run after updating any match results
- Run before publishing leaderboard to captains

---

## Common Workflows

### Season Start Workflow

1. **Create Season** (Seasons → Create)
2. **Set as Current Season** (Configuration → Current GNL Season)
3. **Enable Signups** (Configuration → Player Signups Enabled)
4. **Players Sign Up** (via Discord bot)
5. **Disable Signups** (after deadline)
6. **Create/Update Teams** (Teams)
7. **Assign Teams to Season** (Teams → Edit → Season Assignment)
8. **Assign Players to Teams** (Teams → Edit → Players)
9. **Create Matches** (Matches → Create for each week)
10. **Create Series** (Series → Create for each match)

### Weekly Operations Workflow

1. **Schedule Series** (Schedule Week → Set dates/times)
2. **Mark Fantasy Matches** (Series → Toggle Is Fantasy Match)
3. **Captains Place Bets** (via Discord `/fantasydashboard`)
4. **Matches are Played**
5. **Report Results** (Series → Report Result, upload replays)
6. **Calculate Fantasy Scores** (Fantasy Leaderboard → Calculate Scores)
7. **Review Standings** (Teams → View standings, Fantasy → View leaderboard)

### Fantasy League Setup Workflow

1. **Assign Player Tiers** (Players → Edit each player → Fantasy Tier)
2. **Enable Fantasy Creation** (Configuration → Fantasy Team Creation Enabled)
3. **Configure Bet Settings** (Configuration → Fantasy Betting Settings)
4. **Captains Register Teams** (via Discord `/fantasydashboard`)
5. **Mark Fantasy Matches Weekly** (Series → Is Fantasy Match)
6. **Captains Place Bets** (via Discord fantasy dashboard)
7. **Calculate Scores Weekly** (Fantasy Leaderboard → Calculate Scores)
8. **Monitor Leaderboard** (Fantasy → Fantasy Teams Leaderboard)

---

## Tips & Best Practices

### Player Management
- Import players from W3Champions before season starts
- Keep MMR updated for accurate tier assignments
- Use Battle Tags for automatic stat fetching

### Season Planning
- Create matches for all weeks at once for better overview
- Use consistent naming: "Week 1", "Week 2", etc.
- Set Date Frame to help players know scheduling windows

### Match Scheduling
- Schedule high-profile matches as fantasy matches
- Spread fantasy matches across the week for engagement
- Use timezone-aware scheduling (displays in user's local time)

### Fantasy League
- Balance tier distribution for fair drafting
- Start with fixed bet points for simplicity
- Add min/max betting after captains understand the system
- Calculate scores promptly after each week
- Feature 3-7 fantasy matches per week for optimal engagement

### Data Management
- Regularly backup replay files
- Keep player Discord IDs updated for bot integration
- Review configuration settings before each season
- Test Discord bot integration before season start

---

## Troubleshooting

### Players Can't Sign Up
- Check **Player Signups Enabled** is ON
- Verify **Current GNL Season** is set
- Ensure **Signup Channel ID** is correct in configuration
- Restart Discord bot after configuration changes

### Fantasy Teams Can't Register
- Check **Fantasy Team Creation Enabled** is ON
- Verify **Current GNL Season** is set
- Ensure **Fantasy Dashboard Channel ID** is correct
- Verify player tiers are assigned (6 tiers required)

### Bets Not Saving
- Check bet points are within min/max range
- Verify **Fantasy Betting Settings** are configured
- Ensure series is marked as **Is Fantasy Match**
- Check series hasn't been played yet (locked after results)

### Scores Not Calculating
- Verify all series results are reported
- Check replay files are uploaded
- Ensure teams and players are properly assigned
- Re-run **Calculate Scores** button

---

## Support

For technical issues or feature requests, contact the development team or refer to the GitHub repository documentation.

**Version:** 1.0  
**Last Updated:** November 2025
