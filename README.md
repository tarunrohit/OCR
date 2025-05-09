# Universal Document Scanner

A web application designed for Optical Character Recognition (OCR) to extract information from various identity documents such as Passports, PAN cards, and Aadhaar cards. It offers a user-friendly interface to upload document images and view the extracted data.

## Features

-   **Document Type Selection:** Easily choose between Passport, PAN Card, or Aadhaar Card.
-   **Image Upload:** Supports PNG, JPG, and JPEG image formats (up to 5MB).
    -   Click-to-select file dialog.
    -   Drag & drop functionality for image uploading.
    -   Image preview before processing.
    -   Option to clear/remove the uploaded image.
-   **OCR Processing:** Simulates document scanning and text extraction.
-   **Results Display:**
    -   Shows the uploaded document image.
    -   Lists extracted information in a structured format (e.g., Name, Document Number, Date of Birth).
    -   Displays MRZ (Machine Readable Zone) text for relevant documents like Passports.
-   **Loading & Error States:** Provides feedback during processing and displays relevant error messages.
-   **Responsive Design:** Adapts to different screen sizes with a modern, glass-effect UI.

## Demo

The application allows a user to:
1.  Select a document type (e.g., "Passport").
2.  Upload an image of the document. A preview of the uploaded image is shown.
3.  Click the "Scan Document" button.
4.  Wait for a brief "Processing..." period.
5.  View the scan results, which include:
    *   A larger view of the uploaded image.
    *   Key information extracted from the document (e.g., First Name, Surname, Passport Number, Date of Birth, Gender, Nationality, Expiry Date).
    *   The raw Machine Readable Zone (MRZ) text, if applicable.

*(You can replace this text with a GIF or a link to a live demo if you have one.)*

## Prerequisites

To run this project locally, you will need:
-   Node.js (Recommended: Latest LTS version)
-   npm (comes with Node.js) or yarn

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### 1. Clone the Repository

Open your terminal or command prompt and run:
```bash
git clone "https://github.com/tarunrohit/OCR.git"
cd OCR
