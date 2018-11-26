import { Component, createElement } from "react";
import * as Dropzone from "dropzone";
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
    className?: string;
    divStyle?: object;
    onComplete?: () => void;
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
        return createElement("div", { className: "dropzoneContainer" },
            createElement("form", { className: "dropzone", id: "dropzoneArea", ref: this.getFileUploadNode }),
            createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.alertMessage)
        );
    }

    componentDidMount() {
        if (this.fileUploadNode) {
            this.dropzone = new Dropzone(this.fileUploadNode, {
                url: "/not/required/",
                dictDefaultMessage: this.props.message,
                uploadMultiple: true,
                autoProcessQueue: false,
                addRemoveLinks: false,
                createImageThumbnails: true,
                thumbnailWidth: this.props.thumbnailWidth,
                thumbnailHeight: this.props.thumbnailHeight,
                previewTemplate
            }).on("addedfile", () => {
                return this.props.onComplete && this.props.onComplete();
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
