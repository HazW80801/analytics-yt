"use client"
import { useEffect, useState } from "react";
import Logo from "../comps/Logo";
import { supabase } from "@/config/Supabase_Client";
import useUser from "@/hooks/useUser";
import { useRouter } from "next/navigation";

export default function AddPage() {
    const [step, setStep] = useState(1)
    const [error, setError] = useState("")
    const [website, setWebsite] = useState("")
    const [loading, setLoading] = useState(false)
    const [user] = useUser()
    const router = useRouter()
    const addWebsite = async () => {
        if (website.trim() == "" || loading) return;
        setLoading(true)
        const { data, error } =
            await supabase.from("websites").insert([{ website_name: website.trim(), user_id: user.id }]).select()
        setLoading(false)
        setStep(2)
    }
    const checkDomainAddedBefore = async () => {
        let fetchedWebsites = [];
        const { data: websites, error } = await supabase.from("websites").select("*")
        fetchedWebsites = websites
        if (fetchedWebsites.filter(item => item.website_name == website).length > 0) {
            setError("this domain is added before")
        } else {
            setError("")
            addWebsite()
        }

    }
    useEffect(() => {
        if (
            website.trim().includes("http") ||
            website.trim().includes("http://") ||
            website.trim().includes("https://") ||
            website.trim().includes("://") ||
            website.trim().includes(":") ||
            website.trim().includes("/")
        ) {
            setError("please enter the domain only. ie:(google.com)");
        } else {
            setError("");
        }
    }, [website]);
    return (
        <div className="w-full min-h-screen bg-black items-center justify-center flex flex-col">
            <Logo sizr="lg" />
            <div className="items-center justify-center p-12 mt-10
             flex flex-col w-full z-0 border-y border-white/5 bg-black text-white">
                {step == 1 ? <div className="w-full items-center justify-center flex flex-col space-y-10">
                    <span className="w-full lg:w-[50%] group">
                        <p className="text-white/40 pb-4 group-hover:text-white smooth">Domain</p>
                        <input value={website}
                            onChange={(e) => setWebsite(e.target.value.trim().toLowerCase())} className="input" />
                        {error ? <p className="text-xs pt-2 font-light text-red-400">{error}</p>
                            : <p className="text-xs pt-2 font-light text-white/20">enter the domain or subdomain without {"www"}</p>}
                    </span>
                    {error == "" && <button className="button" onClick={checkDomainAddedBefore}>
                        {loading ? "adding..." : "add website"}
                    </button>}
                </div> : <div className="w-full items-center justify-center flex flex-col space-y-10">
                    <span className="w-full lg:w-[50%]">
                        <textarea type="text" className="input text-white/20 cursor-pointer" disabled
                            value={`<script defer data-domain="${website}"
                src="http://localhost:3000/tracking-script.js"></script>`} />
                        <p className="text-xs text-white/20 pt-2 font-light">
                            paste this snippet in the <b className="text-red-600">{"<head>"}</b> of your website
                        </p>
                    </span>
                    <button onClick={() => router.push(`/w/${website.trim()}`)} className="button">
                        added
                    </button>
                </div>}
            </div>
        </div>
    )
}