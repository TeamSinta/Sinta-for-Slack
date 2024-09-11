import mixpanel from "mixpanel";

const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN ?? "";
const mixpanelServer = mixpanel.init(MIXPANEL_TOKEN);

// interface Mixpanel_User {
//     organization: string;
//     email: string;
//     type: string;
//     signup_at: Date;
//     userRole: "Admin" | "User";
// }

const MixpanelServer = {
    track: (event: string, properties = {}) => {
        mixpanelServer.track(event, properties);
    },
    identify: (id: string, properties = {}) => {
        mixpanelServer.people.set(id, properties);
    },
};

export default MixpanelServer;
