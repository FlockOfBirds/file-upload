import { Component, createElement } from "react";
import { FileUpload } from "./FileUpload";
import Utils from "../utils/Utils";

export interface WrapperProps {
    class?: string;
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    style?: string;
    readOnly?: boolean;
    friendlyId?: string;
    mxContext: mendix.lib.MxContext;
}

export interface FileUploadContainerProps extends WrapperProps {
    fileEntity: string;
    message: string;
    maxFileSize: number;
    maxFiles: number;
    fileTypes: string;
    autoUpload: boolean;
    thumbnailWidth: number;
    thumbnailHeight: number;
    onUploadMicroflow: string;
    onUploadNanoflow: mx.Nanoflow;
    onUploadEvent: UploadEvent;
}

interface FileUploadContainerState {
    alertMessage: string;
}

type UploadEvent = "callMicroflow" | "callNanoflow";

export default class FileUploadContainer extends Component<FileUploadContainerProps, FileUploadContainerState> {
    private subscriptionHandles: number[] = [];
    // private formHandle?: number;

    readonly state: FileUploadContainerState = {
        alertMessage: ""
    };

    render() {
        return createElement(FileUpload, {
            message: this.props.message,
            maxFileSize: this.props.maxFileSize,
            maxFiles: this.props.maxFiles,
            fileTypes: this.props.fileTypes,
            autoUpload: this.props.autoUpload,
            thumbnailHeight: this.props.thumbnailHeight,
            thumbnailWidth: this.props.thumbnailWidth,
            onComplete: this.executeAction,
            divStyle: Utils.parseStyle(this.props.style),
            className: this.props.class
        });
    }

    componentWillReceiveProps(newProps: FileUploadContainerProps) {
        this.resetSubscriptions(newProps.mxObject);
    }

    componentDidMount() {
        // this.formHandle = this.props.mxform.listen("commit", callback => this.saveFile(callback));
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        this.subscriptionHandles = [];

        if (mxObject) {
            // this.subscriptionHandles.push(window.mx.data.subscribe({
            //     guid: mxObject.getGuid(),
            //     callback: () => this.updateCanvasState()
            // }));
        }
    }

    // private saveFile(guid: string, file: DropzoneLib.DropzoneFile, dropzone: DropzoneLib) {
    //     mx.data.saveDocument(guid, file.name, {}, file,
    //         () => {
    //             dropzone.emit("complete", file);
    //             dropzone.emit("success", file);
    //         },
    //         error => mx.ui.error(`${error}`)
    //     );
    // }

    private executeAction = () => {
        const { mxform, onUploadMicroflow, onUploadNanoflow } = this.props;

        if (this.props.onUploadEvent === "callMicroflow" && onUploadMicroflow) {
            window.mx.data.action({
                params: {
                    applyto: "selection",
                    actionname: onUploadMicroflow,
                    guids: [ this.props.mxObject.getGuid() ]
                },
                origin: mxform,
                error: error => mx.ui.error(`error while executing action ${onUploadMicroflow} ${error.message}`)
            });

        } else if (this.props.onUploadEvent === "callNanoflow" && onUploadNanoflow && onUploadNanoflow.nanoflow) {
            const context = new mendix.lib.MxContext();
            window.mx.data.callNanoflow({
                nanoflow: onUploadNanoflow,
                origin: mxform,
                context,
                error: error => mx.ui.error(`error while executing action nanoflow ${error.message}`)
            });
        }
    }
}
