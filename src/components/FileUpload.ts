import { Component, createElement } from "react";
import * as DropzoneLib from "dropzone";
import { Alert } from "./Alert";
import "dropzone/dist/dropzone.css";
import "../ui/DropZone.css";
import "../ui/FileUpload.scss";
import previewTemplate from "../utils/previewTemplate";

export interface FileUploadProps {
    message: string;
    maxFileSize: number;
    maxFiles: number;
    fileTypes: string;
    autoUpload: boolean;
    thumbnailWidth: number;
    thumbnailHeight: number;
    fileobject: ReturnObject;
    executeAction?: (event: string) => void;
    createObject?: (file: DropzoneLib.DropzoneFile) => void;
    saveFileToDatabase?: (guid: string, file: DropzoneLib.DropzoneFile, dropzone: DropzoneLib) => void;
}

export interface ReturnObject {
    file?: DropzoneLib.DropzoneFile;
    guid: string;
    status: "pending" | "uploaded";
}

interface FileUploadState {
    fileError: string;
}

export class FileUpload extends Component<FileUploadProps, FileUploadState> {
    private dropzone!: DropzoneLib;
    private formNode!: HTMLElement;
    private arrayOfFiles: ReturnObject[] = [];
    private numberOfFilesUploaded = 0;
    private fileRemover = "user";
    private lastAddedTime = new Date().getSeconds();

    readonly state: FileUploadState = {
        fileError: ""
    };

    render() {
        return createElement("div", { className: "dropzoneContainer" },
            !this.props.autoUpload ? createElement("button", {
                className: "btn mx-button uploadButton",
                onClick: this.handleUpload
            }, "upload file(s)") : "",
            createElement("form", { className: "dropzone", id: "dropzoneArea", ref: this.getFormNode }),
            createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.fileError)
        );
    }

    componentDidMount() {
        if (this.formNode) {
            this.dropzone = new DropzoneLib(this.formNode, {
                url: "/not/required/",
                dictDefaultMessage: this.props.message,
                uploadMultiple: true,
                autoProcessQueue: false,
                addRemoveLinks: false,
                createImageThumbnails: true,
                thumbnailWidth: this.props.thumbnailWidth,
                thumbnailHeight: this.props.thumbnailHeight,
                previewTemplate
            });
            this.dropzone.on("error", this.handleErrorsFromLibrary);
            this.dropzone.on("addedfile", (file) => { this.handleAddedFile(file); });
            this.dropzone.on("removedfile", (file) => { this.handleRemovedFile(file); });
            this.dropzone.on("drop", this.handleOnDropEvent);
        }
    }

    componentWillUnmount() {
        if (this.dropzone) {
            this.dropzone.destroy();
        }
    }

    componentWillReceiveProps(newProps: FileUploadProps) {
        if (newProps.fileobject.file) {
            this.arrayOfFiles.push(newProps.fileobject);
            if (this.props.autoUpload) {
                this.handleUpload();
            }
        }
    }

    private handleAddedFile(file: DropzoneLib.DropzoneFile) {
        const currentTime = new Date().getSeconds();
        if (currentTime - this.lastAddedTime > 1.5) {
            this.setState({ fileError: "" });
        }

        this.lastAddedTime = currentTime;
        if (this.props.createObject) {
            this.props.createObject(file);
        }
    }

    private handleOnDropEvent = () => {
        if (this.props.executeAction) {
            this.props.executeAction("onDrop");
        }
    }

    private customErrorHandler = (file: DropzoneLib.DropzoneFile) => {
        const fileExtension = file.name.split(".").pop();
        const sizeLimit = this.props.maxFileSize * (2 ** 20);
        let displayMessage = "";

        if (file.size > sizeLimit) {
            displayMessage = `${file.name} wont be uploaded, file too big, limit is ${this.props.maxFileSize} MB(s)\n`;
        } else if (this.numberOfFilesUploaded === this.props.maxFiles) {
            displayMessage = `${file.name} wont be uploaded, exceded limit of ${this.props.maxFiles} files\n`;
        } else if (this.props.fileTypes && fileExtension && !this.props.fileTypes.includes(fileExtension)) {
            displayMessage = `${file.name} wont be uploaded, file type not support for upload\n`;
        }
        if (displayMessage) {
            this.setState({
                fileError: `${this.state.fileError} ${displayMessage}`
            });
        }
    }

    private handleRemovedFile = (file: DropzoneLib.DropzoneFile) => {
        if (this.fileRemover === "user" && this.state.fileError) {
            this.setState({ fileError: "" });
        } else if (this.fileRemover === "errorHandler") {
            this.fileRemover = "user";
        }

        if (this.arrayOfFiles.length) {
            this.arrayOfFiles.map((fileobject) => {
                if (file === fileobject.file) {
                    if (fileobject.status === "uploaded") {
                        this.numberOfFilesUploaded--;
                    }
                    this.arrayOfFiles.splice(this.arrayOfFiles.indexOf(fileobject), 1);
                    mx.data.remove({
                        guid: fileobject.guid,
                        callback: () => {
                            if (this.props.executeAction) {
                                this.props.executeAction("onRemove");
                            }
                        },
                        error: error => {
                            mx.ui.error(`Error attempting to remove dropzone item  ${error}`);
                        }
                    });
                }
            });
        }
    }

    private handleUpload = () => {
        if (this.arrayOfFiles.length) {
            this.arrayOfFiles.map((fileobject) => {
                if (fileobject.file && fileobject.status === "pending") {
                    this.customErrorHandler(fileobject.file);
                    if (this.state.fileError && this.dropzone) {
                        this.fileRemover = "errorHandler";
                        this.dropzone.removeFile(fileobject.file);
                    } else {
                        this.upload(fileobject);
                    }
                }
            });
        }
    }

    private upload = (returnedObject: ReturnObject) => {
        if (returnedObject.file && this.props.saveFileToDatabase) {
            returnedObject.status = "uploaded";
            this.numberOfFilesUploaded++;
            this.props.saveFileToDatabase(returnedObject.guid, returnedObject.file, this.dropzone);

            if (this.props.executeAction) {
                this.props.executeAction("onUpload");
            }
        }
    }

    private handleErrorsFromLibrary = (file: DropzoneLib.DropzoneFile, message: string) => {
        const displayMessage = `${file.name} wont be uploaded, ${message}\n`;
        if (this.dropzone) {
            this.dropzone.removeFile(file);
        }
        this.setState({
            fileError: `${this.state.fileError} ${displayMessage}`
        });
    }

    private getFormNode = (node: HTMLElement) => {
        this.formNode = node;
    }

}
