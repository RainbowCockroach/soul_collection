import * as fs from "fs";
import * as path from "path";

/**
 * Interface defining the structure of OC (Original Character) information
 * Each OC has an avatar image, name, description, and a gallery of images
 */
interface OCInfo {
  avatar: string; // Path to the main avatar image
  name: string; // Display name of the OC
  description: string; // Description text about the OC
  gallery: string[]; // Array of image paths for the gallery
}

/**
 * Interface defining the structure of Species information
 * Similar to OCInfo but for species/races
 */
interface SpeciesInfo {
  avatar: string; // Path to the main avatar image
  name: string; // Display name of the species
  description: string; // Description text about the species
  gallery: string[]; // Array of image paths for the gallery
}

/**
 * Reads and parses a JSON file from the given path
 * @param filePath - Path to the JSON file to read
 * @returns Parsed JSON object or null if file is empty/malformed
 */
async function readJsonFile(filePath: string): Promise<any> {
  try {
    const content = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Failed to read ${filePath}:`, error);
    return null;
  }
}

/**
 * Reads the HTML template file from the template directory
 * @param templatePath - Path to the template HTML file
 * @returns Template content as string
 */
async function readTemplate(templatePath: string): Promise<string> {
  return await fs.promises.readFile(templatePath, "utf-8");
}

/**
 * Writes content to a file, creating directories if they don't exist
 * @param filePath - Path where to write the file
 * @param content - Content to write to the file
 */
async function writeFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(filePath, content, "utf-8");
}

/**
 * Copies a file from source to destination, creating directories if needed
 * @param sourcePath - Path to the source file
 * @param destPath - Path where to copy the file
 */
async function copyFile(sourcePath: string, destPath: string): Promise<void> {
  try {
    const destDir = path.dirname(destPath);
    await fs.promises.mkdir(destDir, { recursive: true });
    await fs.promises.copyFile(sourcePath, destPath);
  } catch (error) {
    console.warn(`Failed to copy ${sourcePath} to ${destPath}:`, error);
  }
}

/**
 * Copies images referenced in info.json to the docs folder and returns updated paths
 * @param infoFolder - Path to the info folder (e.g., info/oc/non)
 * @param imagePaths - Array of image paths from info.json
 * @param targetFolder - Target folder in docs (e.g., docs/oc/non)
 * @returns Array of updated image paths for use in HTML
 */
async function copyImagesAndUpdatePaths(
  infoFolder: string,
  imagePaths: string[],
  targetFolder: string
): Promise<string[]> {
  const updatedPaths: string[] = [];

  for (const imagePath of imagePaths) {
    // Try different possible locations for the image
    const possiblePaths = [
      path.join(infoFolder, imagePath), // Direct path
      path.join(infoFolder, "pics", imagePath), // In pics subfolder
      path.join(infoFolder, "pics", path.basename(imagePath)), // In pics with just filename
      path.join(infoFolder, path.basename(imagePath)), // Just filename in main folder
    ];

    let sourcePath: string | null = null;

    // Find the first path that exists
    for (const possiblePath of possiblePaths) {
      try {
        await fs.promises.access(possiblePath, fs.constants.F_OK);
        sourcePath = possiblePath;
        break;
      } catch (error) {
        continue;
      }
    }

    if (!sourcePath) {
      console.warn(`Image not found: ${imagePath} in ${infoFolder}`);
      updatedPaths.push(imagePath);
      continue;
    }

    // Create the destination path in docs folder
    const fileName = path.basename(imagePath);
    const destPath = path.join(targetFolder, fileName);

    // Copy the image file
    await copyFile(sourcePath, destPath);

    // Use only the file name for the HTML src attribute (since image is in the same folder as HTML)
    updatedPaths.push(fileName);
  }

  return updatedPaths;
}

/**
 * Generates an individual OC page by replacing template placeholders with OC data
 * @param ocName - Folder name of the OC (used for file paths)
 * @param ocInfo - OC information object containing avatar, name, description, gallery
 * @returns Generated HTML content for the OC page
 */
async function generateOCPage(ocName: string, ocInfo: OCInfo): Promise<string> {
  // Read the base template
  const template = await readTemplate(
    path.join(__dirname, "../template/index.html")
  );

  // Define paths for copying images
  const infoFolder = path.join(__dirname, "../info/oc", ocName);
  const targetFolder = path.join(__dirname, "../docs/oc", ocName.toLowerCase());

  // Copy avatar and gallery images to docs folder
  const avatarPath = await copyImagesAndUpdatePaths(
    infoFolder,
    [ocInfo.avatar],
    targetFolder
  );
  const galleryPaths = await copyImagesAndUpdatePaths(
    infoFolder,
    ocInfo.gallery,
    targetFolder
  );

  // Generate HTML for the gallery images with updated paths
  const galleryHtml = galleryPaths
    .map(
      (img) =>
        `<img src="${img}" alt="${ocInfo.name}" style="max-width: 200px; margin: 10px;">`
    )
    .join("");

  // Replace template placeholders with OC-specific content
  return (
    template
      // Update page title to include OC name
      .replace(
        /<title>.*?<\/title>/,
        `<title>${ocInfo.name} - Vhhz's soul box</title>`
      )
      // Update main heading to show OC name
      .replace(/<h1>.*?<\/h1>/, `<h1>${ocInfo.name}</h1>`)
      // Replace the TODO section with OC-specific content including avatar, description, gallery, and back link
      .replace(
        /<!-- TODO: Add a list of all the OCs -->[\s\S]*?<\/ul>/,
        `
      <div class="oc-info">
        <img src="${avatarPath[0]}" alt="${ocInfo.name}" style="max-width: 300px; margin: 20px;">
        <p>${ocInfo.description}</p>
        <div class="gallery">
          <h2>Gallery</h2>
          ${galleryHtml}
        </div>
        <p><a href="../index.html">← Back to OCs</a></p>
      </div>
    `
      )
  );
}

/**
 * Generates the main page with a list of all available OCs
 * @param ocs - Array of OC objects containing folder name and info
 * @returns Generated HTML content for the main page
 */
async function generateMainPage(
  ocs: Array<{ name: string; info: OCInfo }>
): Promise<string> {
  // Read the base template
  const template = await readTemplate(
    path.join(__dirname, "../template/index.html")
  );

  // Generate HTML list items for each OC
  const ocListHtml = ocs
    .map(
      (oc) =>
        `<li><a href="oc/${oc.name.toLowerCase()}/index.html">${
          oc.info.name
        }</a></li>`
    )
    .join("");

  // Replace the TODO section with the generated OC list
  return template.replace(
    /<!-- TODO: Add a list of all the OCs -->[\s\S]*?<\/ul>/,
    `
      <ul>
        ${ocListHtml}
      </ul>
    `
  );
}

/**
 * Generates an individual species page by replacing template placeholders with species data
 * @param speciesName - Folder name of the species (used for file paths)
 * @param speciesInfo - Species information object containing avatar, name, description, gallery
 * @returns Generated HTML content for the species page
 */
async function generateSpeciesPage(
  speciesName: string,
  speciesInfo: SpeciesInfo
): Promise<string> {
  // Read the base template
  const template = await readTemplate(
    path.join(__dirname, "../template/index.html")
  );

  // Define paths for copying images
  const infoFolder = path.join(__dirname, "../info/spieces", speciesName);
  const targetFolder = path.join(
    __dirname,
    "../docs/spieces",
    speciesName.toLowerCase()
  );

  // Copy avatar and gallery images to docs folder
  const avatarPath = await copyImagesAndUpdatePaths(
    infoFolder,
    [speciesInfo.avatar],
    targetFolder
  );
  const galleryPaths = await copyImagesAndUpdatePaths(
    infoFolder,
    speciesInfo.gallery,
    targetFolder
  );

  // Generate HTML for the gallery images with updated paths
  const galleryHtml = galleryPaths
    .map(
      (img) =>
        `<img src="${img}" alt="${speciesInfo.name}" style="max-width: 200px; margin: 10px;">`
    )
    .join("");

  // Replace template placeholders with species-specific content
  return (
    template
      // Update page title to include species name
      .replace(
        /<title>.*?<\/title>/,
        `<title>${speciesInfo.name} - Vhhz's soul box</title>`
      )
      // Update main heading to show species name
      .replace(/<h1>.*?<\/h1>/, `<h1>${speciesInfo.name}</h1>`)
      // Replace the TODO section with species-specific content including avatar, description, gallery, and back link
      .replace(
        /<!-- TODO: Add a list of all the OCs -->[\s\S]*?<\/ul>/,
        `
      <div class="species-info">
        <img src="${avatarPath[0]}" alt="${speciesInfo.name}" style="max-width: 300px; margin: 20px;">
        <p>${speciesInfo.description}</p>
        <div class="gallery">
          <h2>Gallery</h2>
          ${galleryHtml}
        </div>
        <p><a href="../index.html">← Back to Species</a></p>
      </div>
    `
      )
  );
}

/**
 * Generates a species list page with links to all available species
 * @param species - Array of species objects containing folder name and info
 * @returns Generated HTML content for the species list page
 */
async function generateSpeciesListPage(
  species: Array<{ name: string; info: SpeciesInfo }>
): Promise<string> {
  // Read the base template
  const template = await readTemplate(
    path.join(__dirname, "../template/index.html")
  );

  // Generate HTML list items for each species
  const speciesListHtml = species
    .map(
      (species) =>
        `<li><a href="spieces/${species.name.toLowerCase()}/index.html">${
          species.info.name
        }</a></li>`
    )
    .join("");

  // Replace template placeholders with species list content
  return (
    template
      // Update page title for species section
      .replace(
        /<title>.*?<\/title>/,
        `<title>Species - Vhhz's soul box</title>`
      )
      // Update main heading for species section
      .replace(/<h1>.*?<\/h1>/, `<h1>Species</h1>`)
      // Replace the TODO section with species list and back link
      .replace(
        /<!-- TODO: Add a list of all the OCs -->[\s\S]*?<\/ul>/,
        `
      <ul>
        ${speciesListHtml}
      </ul>
      <p><a href="index.html">← Back to Main</a></p>
    `
      )
  );
}

/**
 * Main function that orchestrates the entire HTML generation process
 * Reads all info.json files and generates corresponding HTML pages
 */
async function main(): Promise<void> {
  console.log("Starting HTML generation...");

  // ===== GENERATE OC PAGES =====
  // Read all OC folders from the info/oc directory
  const ocDir = path.join(__dirname, "../info/oc");
  const ocFolders = await fs.promises.readdir(ocDir);
  const ocs: Array<{ name: string; info: OCInfo }> = [];

  // Process each OC folder
  for (const folder of ocFolders) {
    const infoPath = path.join(ocDir, folder, "info.json");
    const info = (await readJsonFile(infoPath)) as OCInfo;

    // Only process OCs that have valid info with a name
    if (info && info.name) {
      ocs.push({ name: folder, info });

      // Generate individual OC page
      const ocPageContent = await generateOCPage(folder, info);
      const ocPagePath = path.join(
        __dirname,
        "../docs/oc",
        folder.toLowerCase(),
        "index.html"
      );
      await writeFile(ocPagePath, ocPageContent);
      console.log(`Generated OC page: ${folder}`);
    }
  }

  // Generate main page with list of all OCs
  const mainPageContent = await generateMainPage(ocs);
  await writeFile(path.join(__dirname, "../docs/index.html"), mainPageContent);
  console.log("Generated main page");

  // ===== GENERATE SPECIES PAGES =====
  // Read all species folders from the info/spieces directory
  const speciesDir = path.join(__dirname, "../info/spieces");
  const speciesFolders = await fs.promises.readdir(speciesDir);
  const species: Array<{ name: string; info: SpeciesInfo }> = [];

  // Process each species folder
  for (const folder of speciesFolders) {
    const infoPath = path.join(speciesDir, folder, "info.json");
    const info = (await readJsonFile(infoPath)) as SpeciesInfo;

    // Only process species that have valid info with a name
    if (info && info.name) {
      species.push({ name: folder, info });

      // Generate individual species page
      const speciesPageContent = await generateSpeciesPage(folder, info);
      const speciesPagePath = path.join(
        __dirname,
        "../docs/spieces",
        folder.toLowerCase(),
        "index.html"
      );
      await writeFile(speciesPagePath, speciesPageContent);
      console.log(`Generated species page: ${folder}`);
    }
  }

  // Generate species list page if there are any species
  if (species.length > 0) {
    const speciesListContent = await generateSpeciesListPage(species);
    await writeFile(
      path.join(__dirname, "../docs/spieces/index.html"),
      speciesListContent
    );
    console.log("Generated species list page");
  }

  console.log("HTML generation completed!");
}

// Execute the main function and handle any errors
main().catch(console.error);
