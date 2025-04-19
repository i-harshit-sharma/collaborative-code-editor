import React, { useState, useRef } from "react";
import { CircleX, Image, Pen, SendHorizontal } from "lucide-react";
import { Mistral } from "@mistralai/mistralai";
// import { DNA } from 'react-loader-spinner'

export function TextArea(props) {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const handleImageUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview((prev) => [...prev, previewUrl]);
        }
    };

    const handleImageDelete = (url) => {
        setImagePreview((prev) => prev.filter((img) => img !== url));
    };

    const ImprovePrompt = async () => {
        let t = text;
        setText('')
        setIsLoading(true); // Start loader

        try {
            const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
            const client = new Mistral({ apiKey: apiKey });
            const chatResponse = await client.agents.complete({
                agentId: "ag:d9f93acc:20250416:untitled-agent:d9a7612d",
                messages: [{ role: 'user', content: t }],
            });

            setText(chatResponse.choices[0].message.content);
        } catch (error) {
            console.error("Error while improving prompt:", error);
        } finally {
            setIsLoading(false); // Stop loader
        }
    };


    return (
        <div className="relative w-full border-1 border-dark-1 rounded p-2 transition-colors focus-within:border-blue-500 focus-within:shadow-md">
            {imagePreview.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {imagePreview.map((image, index) => (
                        <div key={index} className="relative w-fit">
                            <CircleX
                                size={12}
                                className="absolute top-[-3px] right-[-3px] text-red-700 cursor-pointer"
                                fill="#ffffff"
                                onClick={() => handleImageDelete(image)}
                            />
                            <img
                                src={image}
                                alt="Preview"
                                className="max-h-14 rounded border"
                            />
                        </div>
                    ))}
                </div>
            )}
            <textarea
                className="w-full rounded-md p-2 pr-10 focus:outline-none focus:ring-0 resize-none"
                placeholder="Type your message here..."
                rows={4}
                value={text}
                disabled={isLoading} // Disable textarea when loading
                onChange={handleTextChange}
                {...props}
            />
            {/* {isLoading && (
            <DNA
                visible={true}
                height="80"
                width="80"
                ariaLabel="dna-loading"
                wrapperStyle={{position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}
                wrapperClass="dna-wrapper"
            />)} */}

            {/* Image upload buttons */}
            <div className="bottom-2 flex items-center justify-between">
                <button
                    type="button"
                    className="text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={handleImageUploadClick}
                >
                    <Image size={18} />
                </button>
                <div className="flex gap-2">

                    <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 cursor-pointer"
                        onClick={ImprovePrompt}
                        disabled={isLoading}
                    >
                        <Pen size={16} />
                    </button>

                    <button
                        type="button"
                        className="bg-blue-500/20 px-2 text-sm py-1 rounded flex items-center gap-2 cursor-pointer"
                        disabled={isLoading}
                        // onClick={handleImageUploadClick}
                    >

                        Start Building
                        <SendHorizontal size={12} />
                    </button>
                </div>
            </div>

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
            />
        </div>
    );
}
