import { ActionFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { deleteContact } from "../data";

export const action = async ({ params }: ActionFunctionArgs) => {
    const { contactId } = params;
    invariant(contactId, "Missing contactId parameter");
    await deleteContact(contactId);
    return redirect("/");
}