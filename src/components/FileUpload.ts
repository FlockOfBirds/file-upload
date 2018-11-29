import { Component, createElement } from "react";
import * as Dropzone from "dropzone";
import { Alert } from "./Alert";
import previewTemplate from "../utils/previewTemplate";
import "dropzone/dist/dropzone.css";
import "../ui/DropZone.css";
import "../ui/FileUpload.scss";
import "bootstrap/dist/css/bootstrap.css";

export interface FileUploadProps {
    alertMessage: string;
    maxFileSize: number;
    maxFiles: number;
    fileTypes: string;
    autoUpload: boolean;
    thumbnailWidth: number;
    thumbnailHeight: number;
    className?: string;
    divStyle?: object;
    executeAction?: () => void;
    onUpload?: (file: Dropzone.DropzoneFile) => void;
}

interface FileUploadState {
    alertMessage: string;
}

export class FileUpload extends Component<FileUploadProps, FileUploadState> {
    private dropzone!: Dropzone;
    private fileUploadNode!: HTMLElement;
    readonly state: FileUploadState = {
        alertMessage: ""
    };

    render() {
        return createElement("div", { className: "widget-file-upload" },
            createElement("form", { className: "dropzone", id: "dropzoneArea", ref: this.getFileUploadNode }),
            createElement(Alert, { className: "widget-file-upload-alert" }, this.props.alertMessage)
        );
    }

    componentDidMount() {
        if (this.fileUploadNode) {
            this.dropzone = new Dropzone(this.fileUploadNode, {
                url: "/not/required/",
                dictDefaultMessage: "Drag and Drop your files",
                uploadMultiple: true,
                autoProcessQueue: false,
                maxFiles: this.props.maxFiles,
                acceptedFiles: this.props.fileTypes,
                maxFilesize: this.props.maxFileSize,
                thumbnailWidth: this.props.thumbnailWidth,
                thumbnailHeight: this.props.thumbnailHeight,
                previewTemplate
            }).on("addedfile", (file: Dropzone.DropzoneFile) => {
                if (this.props.onUpload) {
                    return this.props.onUpload(file);
                }
            }).on("addedfile", () => {
                if (this.props.executeAction) {
                    return this.props.executeAction();
                }
            });
        }
    }

    componentWillReceiveProps(newProps: FileUploadProps) {
        if (newProps) {
            // TODO: receive new props
        }
    }

    componentWillUnmount() {
        if (this.dropzone) {
            this.dropzone.destroy();
        }
    }

    private getFileUploadNode = (node: HTMLElement) => {
        this.fileUploadNode = node;
    }

}
