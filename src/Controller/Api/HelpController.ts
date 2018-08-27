export default class HelpController {

    public static getHelp(req, res): void {
        res.json({message: "Sorry can't help you"});
    }

}
