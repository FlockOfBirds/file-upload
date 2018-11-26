export default class Utils {
    public static parseStyle(style = ""): { [key: string]: string } {
        try {
            return style.split(";").reduce<{ [key: string]: string }>((styleObject, line) => {
                const pair = line.split(":");
                if (pair.length === 2) {
                    const name = pair[0].trim().replace(/(-.)/g, match => match[1].toUpperCase());
                    styleObject[name] = pair[1].trim();
                }
                return styleObject;
            }, {});
        } catch (error) {
            const message = "Failed to parse style";
            // tslint:disable-next-line:no-console
            window.logger ? window.logger.error(message) : console.log(message, style, error);
        }

        return {};
    }
}
