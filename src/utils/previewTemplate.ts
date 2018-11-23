const previewTemplate = `
    <div class="dz-preview dz-file-preview">
    <div class="dz-details"></div>
    <table border="1" class="table">
        <tr>
            <td style="text-align:left">
                <div class="dz-img ">
                    <img data-dz-thumbnail />
                </div>
            </td>
            <td class=".container-fluid centerTd" style="text-align:left">
                <div class="dz-members ">
                    <div class="dz-filename member-align lead ">
                        <span data-dz-name></span>
                    </div>
                    <div class="dz-size member-align" data-dz-size></div>
                    <a class="dz-remove member-align removeFileLink" href="javascript:undefined; " data-dz-remove=" ">Remove file</a>
                </div>
            </td>
            <td>
                <div class="container">
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
                </div>
                <div class="dz-success-mark ">
                    <span>✔</span>
                </div>
                <div class="dz-error-mark ">
                    <span>✘</span>
                </div>
                <div class="dz-error-message ">
                    <span data-dz-errormessage></span>
                </div>
            </td>
        </tr>
    </table>
    </div>`;

export default previewTemplate;
