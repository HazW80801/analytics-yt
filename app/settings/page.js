"use client"
import useUser from "@/hooks/useUser"
import { redirect } from "next/navigation"
import Header from "../comps/Header"
import { supabase } from "@/config/Supabase_Client"
import { useEffect, useState } from "react"
import SyntaxHighlighter from "react-syntax-highlighter";
import { sunburst } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)
    const [apiKey, setApiKey] = useState("")
    const [user] = useUser()
    useEffect(() => {
        if (!user) return
        if (user == "no user") redirect("/signin")
    }, [user])
    const getUserAPIs = async () => {
        setLoading(true)
        const { data, error } =
            await supabase.from("users").select().eq("user_id", user.id)
        if (data.length > 0) {
            setApiKey(data[0].api)
        }
        setLoading(false)
    }
    const generateApiKey = async () => {
        setLoading(true)
        if (loading || !user) return;
        const randomString =
            Math.random().toString(36).substring(2, 300) + Math.random().toString(36).substring(2, 300)
        const { data, error } = await supabase.from("users").insert([{ api: randomString, user_id: user.id }])
        if (error) console.error(error)
        setApiKey(randomString)
        setLoading(false)
    }
    const copyApiKey = () => {
        navigator.clipboard.writeText(apiKey)
        alert("API key copied to the clipboard!")
    }
    useEffect(() => {
        if (!user || !supabase) return;
        getUserAPIs()
    }, [user, supabase])

    if (user == "no user") {
        <div>
            <Header />
            <div className="min-h-screen items-center justify-center flex flex-col w-full z-40 text-white">
                Redirecting....
            </div>
        </div>
    }
    return (
        <div className="w-full min-h-screen bg-black items-center justify-center flex flex-col" >
            <Header />
            <div className="min-h-screen items-center justify-center flex flex-col w-full z-40 text-white">
                {!apiKey && !loading &&
                    <button className="button" onClick={generateApiKey}>Generate API Key</button>}
                {apiKey &&
                    <div className="mt-12 border-white/5 border bg-black space-y-12
                lg:w-1/2 py-12 w-full md:w-3/4">
                        <div className="space-y-12 px-4">
                            <p>YOUR API Key is :</p>
                            <input disabled className="input-disabled" value={apiKey} readOnly type="text" />
                            <button className="button" onClick={copyApiKey}>Copy API Key</button>
                        </div>
                        <div className="space-y-4 border-t border-white/5 bg-black p-6"
                        >
                            <h1> You can create custom events using our api like below </h1>
                            <div>
                                <CodeComp />
                            </div>
                        </div>
                    </div>}
            </div>
        </div>
    )
}

export const CodeComp = () => {
    let codeString = `
 const url = "http://localhost:3000/api/events";
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer {{apiKey}}",
  };
  const eventData = {
    name: "",//* required
    domain: "", //* required
    description: "",//optional
  };

  const sendRequest = async () => {
    axios
      .post(url, eventData, { headers })
      .then()
      .catch((error) => {
        console.error("Error:", error);
      });
  };`;
    return (
        <SyntaxHighlighter language="javascript" style={sunburst}>{codeString}</SyntaxHighlighter>
    )
}