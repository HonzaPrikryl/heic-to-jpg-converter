const fileDropArea = document.getElementById('fileDropArea');
const fileInput = document.getElementById('fileInput');
const chooseFilesButton = document.getElementById('chooseFilesButton');
const selectedFilesText = document.getElementById('selectedFilesText');
const progressBarContainer = document.querySelector('.progress-bar-container');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const outputDiv = document.getElementById('output');

fileDropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    fileDropArea.classList.add('drag-over');
});

fileDropArea.addEventListener('dragleave', () => {
    fileDropArea.classList.remove('drag-over');
});

fileDropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    fileDropArea.classList.remove('drag-over');

    const files = event.dataTransfer.files;
    fileInput.files = files;
    updateSelectedFilesText(files);
});

chooseFilesButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    updateSelectedFilesText(files);
});

function updateSelectedFilesText(files) {
    if (files.length === 0) {
        selectedFilesText.textContent = "No files selected";
    } else {
        const multipleFiles = files.length > 1;
        if (!multipleFiles) selectedFilesText.textContent = `${files.length} file selected`;
        else {
            selectedFilesText.textContent = `${files.length} files selected`;
        }
    }
}

document.getElementById('convertButton').addEventListener('click', async () => {
    const files = fileInput.files;

    outputDiv.innerHTML = "";
    progressBar.style.width = "0%";
    progressText.textContent = "";

    if (files.length === 0) {
        alert("Please select at least one HEIC file.");
        return;
    }

    progressBarContainer.style.display = "block";

    const zip = new JSZip();
    let conversionCount = 0;
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
        const file = files[i];

        if (file.name.toLowerCase().endsWith(".heic")) {
            try {
                const blob = await heic2any({
                    blob: file,
                    toType: "image/jpeg"
                });

                const fileName = file.name.replace('.heic', '.jpg');
                zip.file(fileName, blob);
                conversionCount++;
            } catch (error) {
                console.error(`Error converting file ${file.name}:`, error);
                const errorMsg = document.createElement('p');
                errorMsg.textContent = `Error converting ${file.name}.`;
                errorMsg.style.color = "red";
                outputDiv.appendChild(errorMsg);
            }
        }

        const progress = Math.round(((i + 1) / totalFiles) * 100);
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Processing: ${i + 1} / ${totalFiles}`;
    }
    if (totalFiles > 1) {
        progressText.textContent = `Processed: ${totalFiles} files`;
    } else {
        progressText.textContent = `Processed: ${totalFiles} file`;
    }
    if (conversionCount > 0) {
        zip.generateAsync({ type: "blob" }).then((zipBlob) => {
            const zipLink = document.createElement('a');
            zipLink.href = URL.createObjectURL(zipBlob);
            zipLink.download = "converted-images.zip";
            zipLink.textContent = "Download all converted images";
            zipLink.className = "download-link";
            outputDiv.appendChild(zipLink);

            progressBarContainer.style.display = "none";
        });
    } else {
        progressBarContainer.style.display = "none";
        outputDiv.textContent = "No HEIC files were converted.";
    }
});
