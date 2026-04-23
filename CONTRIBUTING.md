# 🤝 Contributing to Xenova Archive

We welcome contributions to expand the lore, refine the visuals, or improve the technical architecture of the Xenova Archive.

## 🌌 Lore Guidelines
The Xenova universe is built on "Melancholic Futurism." When adding new planets, artifacts, or codex entries:
- **Consistency**: Refer to `src/data/planetData.js` and `src/data/artifacts.js` for existing names and events.
- **Tone**: Keep descriptions haunting and technical. Use words like "Cycle," "Resonance," "Lattice," and "Correction."
- **Eras**: Ensure all new content fits into one of the three established eras:
    - **Discovery**: Hopeful, industrial, raw.
    - **Ascension**: Divine, sterile, high-tech.
    - **The Great Mistake**: Decaying, radioactive, silent.

## 🛠️ Technical Workflow
1. **Styling**: Use the existing design tokens in `index.css`. We prefer Glassmorphism (`backdrop-filter: blur()`) and high-contrast glow effects.
2. **Animations**: 
    - Use **Framer Motion** for simple entry/exit transitions.
    - Use **GSAP** for sequence-heavy animations (like the Terminal boot).
3. **3D**: 
    - Keep models under 5MB (GLB format preferred).
    - Use the `compress_models.sh` script if provided.

## 🧩 Adding a New Relic
1. Add the model file to `public/models/`.
2. Add the relic metadata to `src/data/artifacts.js`.
3. Add at least one related trivia question to `src/pages/Terminal.jsx` in the `getRelicQuestions` function.

## 📟 Adding Terminal Commands
The terminal logic is located in `src/pages/Terminal.jsx`. To add a command:
1. Update the `runCommand` switch statement.
2. Add the command description to the `help` case.

---
*Thank you for helping us preserve what remains of the Xenova.*
