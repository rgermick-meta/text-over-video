# AI Style Assistant Setup Guide

This application includes an AI-powered conversational interface that helps users style text overlays using natural language.

## Quick Setup

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure the Environment

1. Open the `.env` file in the root directory
2. Replace `your_api_key_here` with your actual API key:

```env
VITE_GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

3. Save the file

### 3. Run the Application

```bash
npm run dev
```

## Using the AI Style Assistant

The AI Style Assistant appears in the right column of the interface. Here's how to use it:

### Basic Usage

1. **Select a text element** from the Text Editor (left panel)
2. **Type your request** in natural language in the chat input
3. **Press Enter** or click the send button
4. The AI will interpret your request and apply the changes automatically

### Example Requests

Try these natural language requests:

#### Size & Weight
- "Make it bigger and bold"
- "Increase the font size"
- "Make it slightly smaller"

#### Colors
- "Make it pink"
- "Add a blue glow"
- "Change color to purple"

#### Effects
- "Add a subtle shadow"
- "Neon glow effect"
- "3D pop effect"
- "Add a pink gradient"

#### Styles
- "Movie title style"
- "Professional and clean"
- "Elegant serif"
- "Retro 80s style"
- "Make it look cinematic"

### Refinement

After the AI applies changes, you can refine them:

- Click **"Too Much"** if the effect is too strong
- Click **"Too Little"** if the effect is too subtle
- Or just type a follow-up request like "make it less bold"

### Quick Suggestions

Click any of the quick suggestion buttons to try common styling requests instantly.

## How It Works

### Architecture

1. **Natural Language Processing**: User requests are sent to Google's Gemini 2.0 Flash model
2. **Context Awareness**: The AI considers the current text style, video context, and previous requests
3. **Validation Layer**: All AI outputs are validated and sanitized for safety
4. **Confidence Scoring**: The AI provides a confidence score (0-100%) for each interpretation

### Available Properties

The AI can modify these text properties:

- Font family, size, weight (bold), style (italic, underline)
- Text color, text alignment, letter spacing, line height
- Rotation, opacity
- Shadow (color, blur, offset)
- Stroke/outline (color, width)
- Background (color, padding, radius, opacity, gradient)
- Text gradient (colors, angle)
- Animations (fade, slide, bounce, zoom, etc.)

### Preset Matching

The AI automatically recognizes when your request matches an existing preset and will apply it directly for consistent results.

## Tips for Best Results

1. **Be Specific**: Instead of "make it cool", try "add a neon glow effect"
2. **Use Comparisons**: "Bigger", "darker", "more subtle" work well
3. **Combine Effects**: "Make it bold with a pink shadow"
4. **Reference Styles**: "Movie title style", "professional look", etc.
5. **Iterate**: Use follow-up requests to refine: "now make it less bright"

## Troubleshooting

### "Please set VITE_GEMINI_API_KEY" Error

- Make sure your `.env` file exists in the root directory
- Verify your API key is correctly set (no quotes needed)
- Restart the dev server after changing `.env`

### AI Responses Are Too Conservative

- Try being more specific about what you want
- Use stronger adjectives: "very bold", "much bigger"

### Changes Don't Match Expectations

- Use the refinement buttons ("Too Much" / "Too Little")
- Or explain what's wrong: "less colorful" or "more dramatic"

### No Response from AI

- Check your internet connection
- Verify your API key is valid and has quota remaining
- Check the browser console for error messages

## Cost Considerations

Gemini 2.5 Flash Lite is extremely cost-effective:
- Free tier: High rate limits for frequent use
- Most cost-efficient model in the Gemini family
- Optimized for high-frequency tasks
- Average request uses ~500-1000 tokens
- Estimated cost: Negligible for typical usage

For typical usage (10-20 styling requests per session), costs are minimal.

## Privacy & Security

- API key is stored locally in `.env` (not committed to git)
- Requests include only text styling data, no personal information
- No data is stored on Google's servers beyond the API call

## Advanced Usage

### Batch Styling (Coming Soon)

Select multiple text elements and style them all at once with a single request.

### Style Templates (Coming Soon)

Save your favorite AI-generated styles as reusable presets.

### Context-Aware Suggestions (Coming Soon)

The AI will learn from your video content to suggest appropriate styles.

## Support

If you encounter issues:

1. Check this guide first
2. Look at the browser console for error messages
3. Verify your API key setup
4. Try simpler requests to test connectivity

## Example Session

```
You: "Make it bigger and bold"
AI: ✨ Increased font size to 64px and enabled bold text
    [85% confident]

You: "Add a pink glow"
AI: ✨ Added pink glow effect with soft shadow
    [90% confident]

You: "Too much"
AI: ✨ Reduced glow intensity for a more subtle effect
    [88% confident]

You: "Perfect! Now make it cinematic"
AI: ✨ Applied cinematic style with dramatic font and shadow
    [82% confident]
```

Enjoy creating beautiful text overlays with AI assistance! 🎨✨

