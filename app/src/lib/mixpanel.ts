// lib/mixpanel.js
import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ?? "";

mixpanel.init(MIXPANEL_TOKEN);

const Mixpanel = {
    track: (event: string, properties = {}) => {
        mixpanel.track(event, properties);
    },
    identify: (id: string) => {
        mixpanel.identify(id);
    },
    people: {
        set: (properties: any) => {
            mixpanel.people.set(properties);
        },
    },
};

export default Mixpanel;
