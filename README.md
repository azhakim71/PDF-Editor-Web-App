# 🧾 Online PDF Editor Web App

A powerful, modern, and responsive web application that allows users to upload, edit, sign, compress, fill, highlight, and download PDFs — all from the browser.

---

## 🚀 Features

### 📄 PDF Upload
- Drag & drop or upload from file browser
- Real-time PDF preview

### ✍️ Add Signature
- Upload image-based signature
- Drag, move, and resize signature on PDF

### 🧩 PDF Compression
- Choose output quality (Low / Medium / High)
- Set target file size (MB)

### 📝 Form Fill-Up
- Auto-detect fillable PDF forms and allow browser input
- Convert non-fillable PDFs into fillable forms with:
  - Text fields
  - Checkboxes
  - Radio buttons
  - Dropdowns

### 🔡 Add Text
- Add movable/resizable text boxes
- Customize font size and color

### ✨ Highlight Text
- Select text to highlight
- Change highlight color

### ⬇️ Download PDF
- Download final edited PDF with all changes saved

---

## 🖌️ UI/UX Design

- Responsive for desktop, tablet, and mobile
- Clean, modern blue-themed interface
- Built with Tailwind CSS for a minimalist aesthetic
- Smooth animations and intuitive layout

---

## ⚙️ Tech Stack

- **Frontend**: React, Tailwind CSS
- **PDF Rendering**: PDF.js
- **PDF Editing**: pdf-lib, Fabric.js or Konva.js (for interactivity)
- **Optional Advanced Features**: PSPDFKit/Webviewer (enterprise)

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/pdf-editor-app.git
cd pdf-editor-app

# Install dependencies
npm install

# Run the development server
npm run dev
📁 Folder Structure
Copy
Edit
📦 pdf-editor-app
 ┣ 📁 components/
 ┣ 📁 pages/
 ┣ 📁 utils/
 ┣ 📁 assets/
 ┗ 📜 README.md
📌 TODOs
 Integrate OCR for scanned PDFs

 Add cloud saving / local storage history

 Export to image or share via link

📝 License
This project is licensed under the MIT License.

🙌 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss.
