'use client';// This file is part of the CodeBrew project.

import React, {useRef, useState} from 'react'
import Image from "next/image";
import {ICONS} from "@/constants";
import {useScreenRecording} from "@/lib/hooks/useScreenRecording";
import {useRouter} from "next/navigation";



const RecordScreen = () => {

    const [isopen, setIsOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const router = useRouter();

    const {
        isRecording,
        recordedBlob,
        recordedVideoUrl,
        recordingDuration,
        startRecording,
        stopRecording,
        resetRecording
    } = useScreenRecording();

    const closeModal = () => {
        resetRecording();
        setIsOpen(false);
    }

    const handleStartRecording = async () => {
        await startRecording();
    }

    const recordAgain = async () => {
        resetRecording();
        await startRecording();

        if(recordedVideoUrl && videoRef.current) {
            videoRef.current.src = recordedVideoUrl;
        }

    }

    const goToUpload = () => {
        if (!recordedBlob) {
            console.error("No recorded video available for upload.");
            return;
        }

        const url = URL.createObjectURL(recordedBlob);

        sessionStorage.setItem("recordedVideo",
            JSON.stringify({
                url,
                name: `screen-recording-${Date.now()}.webm`,
                type: recordedBlob.type,
                size: recordedBlob.size,
                duration: recordingDuration || 0,
            })
        );

        router.push("/upload");
        closeModal();
    }


    return (
        <div className="record">
            <button className="primary-btn " onClick={() => setIsOpen(true)}>
                <Image src={ICONS.record} alt="record" width={16} height={16} />
                <span>Record for fun</span>
            </button>

            {isopen && (
                <section className="dialog">
                    <div className="overlay-record" onClick={closeModal} />
                        <div className="dialog-content">
                            <figure>
                                <h3>Screen Recording</h3>
                                <button onClick={closeModal}>
                                    <Image src={ICONS.close} alt="close" width={20} height={20} />
                                </button>
                            </figure>

                            <section>
                                {isRecording ? (
                                    <article>
                                        <div />
                                        <span>Recording in progress</span>
                                    </article>
                                ) : recordedVideoUrl ? (
                                        <video ref={videoRef} src={recordedVideoUrl} controls />
                                    ): (
                                        <p>Click record to start capturing your screen</p>

                                    )}
                            </section>

                            <div className="record-box">
                                {!isRecording && !recordedVideoUrl && (
                                    <button onClick={handleStartRecording} className="record-start">
                                        <Image src={ICONS.record} alt="record" width={16} height={16} />
                                        <span>Start Recording</span>
                                    </button>
                                )}

                                {isRecording && (
                                    <button onClick={stopRecording} className="record-stop">
                                        <Image src={ICONS.record} alt="record" width={16} height={16} />
                                        <span>Stop recording</span>
                                    </button>
                                )}

                                {recordedVideoUrl && (
                                    <>
                                        <button onClick={recordAgain} className="record-again">Record Again</button>

                                        <button onClick={goToUpload} className="record-upload">
                                            <Image src={ICONS.upload} alt="upload" width={16} height={16} />
                                            Continue to Upload
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                </section>
            )}
        </div>
    )
}
export default RecordScreen
