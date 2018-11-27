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
}

export interface FileUploadContainerProps extends WrapperProps {
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
    private formHandle?: number;
    private file: any;

    readonly state: FileUploadContainerState = {
        alertMessage: ""
    };

    render() {
        return createElement(FileUpload, {
            alertMessage: this.state.alertMessage,
            maxFileSize: this.props.maxFileSize,
            maxFiles: this.props.maxFiles,
            fileTypes: this.props.fileTypes,
            autoUpload: this.props.autoUpload,
            thumbnailHeight: this.props.thumbnailHeight,
            thumbnailWidth: this.props.thumbnailWidth,
            executeAction: this.executeAction,
            divStyle: Utils.parseStyle(this.props.style),
            className: this.props.class,
            onUpload: this.handleOnUpload
        });
    }

    componentWillReceiveProps(newProps: FileUploadContainerProps) {
        const alertMessage = this.validateProps(newProps.mxObject);

        if (alertMessage) {
            this.setState({ alertMessage });
        }
    }

    componentDidUpdate() {
        this.resetSubscriptions(this.props.mxObject);
    }

    componentDidMount() {
        this.formHandle = this.props.mxform.listen("commit", callback => this.saveFile(callback));
    }

    componentWillUnmount() {
        if (this.formHandle) {
            this.props.mxform.unlisten(this.formHandle);
        }
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        this.subscriptionHandles = [];

        if (mxObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                guid: mxObject.getGuid(),
                callback: () => this.validateProps(mxObject)
            }));
        }
    }

    private handleOnUpload = (file: any) => {
        this.file = file;
        if (this.props.autoUpload) {
            this.saveFile(() => undefined);
        }
    }

    private saveFile(callback: () => void) {
        if (this.file) {
            mx.data.saveDocument(this.props.mxObject.getGuid(), this.file.name,
                {}, this.file,
                callback,
                error => mx.ui.error(`${error}`)
            );
        }
    }

    public validateProps(mxObject: mendix.lib.MxObject): string {
        let errorMessage = "";

        if (mxObject && !mxObject.inheritsFrom("System.FileDocument")) {
            errorMessage = `${this.props.friendlyId}: ${mxObject.getEntity()} does not inherit from "System.File".`;
        }

        return errorMessage;
    }

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
