import datastore from "../../../services/datastore"
import { addtag, createGhlContact, createTag, getcontact } from "../../../services/ghl";

// check if the locationId exists in database
export default async function type(req, res) {
    res.sendStatus(200);
    console.log('Request body from twilio flow : ', req.body);
    /* req.body = {
        "tags":"text_back", // the tag that is mentioned in the twilio flow
        "caller": {{trigger.call.From}} , // the number called from
        "to": {{trigger.call.To}} , ;// the number called to i.e. our twilio number
        "flow_sid": {{flow.sid}} // the flow sid of the flow that was called
        } */
    let tags = req.body.tags;
    let caller = req.body.caller;
    let to = req.body.to;
    let flow_sid = req.body.flow_sid;

    try {
        var loc = await datastore.FilterEquals("locations", "sid", flow_sid);
        loc = loc[0];
        if (Object.keys(loc).length === 0) {
            console.log("location not found");
            return;
        }
        var v1api = loc.ghlv1api;
        try {
            await createTag(tags, v1api);
        } catch (e) {
            console.log("Tag error on attempt : ", e.message);
        }
        await addtag(contact_id, tags, v1api);
    } catch (e) {
        console.log(e.message);
        return;
    }
}