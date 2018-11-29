const previewTemplate = `
    <div class="dz-preview dz-file-preview">
        <div class="dz-details"></div>
        <div class="container">
        <div class="row">
            <div class="col-sm">
                <div class="dz-img ">
                    <img data-dz-thumbnail />
                </div>
            </div>
            <div class="col-sm">
                <div class="dz-members ">
                    <div class="dz-filename member-align lead ">
                        <span data-dz-name></span>
                    </div>
                    <div class="dz-size member-align" data-dz-size></div>
                        <a class="dz-remove member-align removeFileLink" href="javascript:undefined; " data-dz-remove=" ">
                            Remove file
                        </a>
                </div>
            </div>
            <div class="col-sm">
                <div class="progress" data-percentage="100">
                    <span class="progress-left">
                        <span class="progress-bar"></span>
                    </span>
                    <span class="progress-right">
                        <span class="progress-bar"></span>
                    </span>
                    <div class="progress-value">
                        <div className="dz-mark">
                            ✔
                        </div>
                    </div>
                </div>
                <div class="dz-error-mark">
                    <span>✘</span>
                </div>
                <div class="dz-error-message ">
                    <span data-dz-errormessage></span>
                </div>
            </div>
        </div>
    </div>`;

export default previewTemplate;
