'use client';

import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react'
import FormField from "@/components/FormField";
import FileInput from "@/components/FileInput";
import {useFileInput} from "@/lib/hooks/useFileInput";
import {MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE} from "@/constants";
import {getThumbnailUploadUrl, getVideoUploadUrl, saveVideoDetails} from "@/lib/actions/video";
import {useRouter} from "next/navigation";

const uploadFileToBunny = (file: File, uploadUrl: string, accessKey: string):Promise<void> => {
    return fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'AccessKey': accessKey,
            'Content-Type': file.type,
        },
        body: file,
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`Failed to upload file: ${response.statusText}`);
        }
    })
}

const Page = () => {

    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [videoDuration, setVideoDuration] = useState(0);



    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: 'public',
    })


    const video = useFileInput(MAX_VIDEO_SIZE);
    const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE);

    useEffect(() => {
        if(video.duration !== null || 0) {
            setVideoDuration(video.duration);
        }
    }, [video.duration])

    useEffect(() => {
        const checkForRecordedVideo = async () => {
            try{
                const stored = sessionStorage.getItem("recordedVideo");

                if(!stored) return;

                const { url, name, type, size, duration } = JSON.parse(stored);


                let blob: Blob;
                try {
                    blob = await fetch(url).then(res => res.blob());
                } catch (err) {
                    console.error("Failed to fetch recorded video blob:", err);
                    sessionStorage.removeItem("recordedVideo");
                    return;
                }

                const file = new File([blob], name, { type, lastModified: Date.now() });


                if(video.inputRef.current) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    video.inputRef.current.files = dataTransfer.files;

                    const event = new Event('change', { bubbles: true });

                    video.inputRef.current.dispatchEvent(event);

                    video.handleFileChange({
                        target: {
                            files: dataTransfer.files,
                        }
                    } as ChangeEvent<HTMLInputElement>)
                }

                if(duration) setVideoDuration(duration);

                sessionStorage.removeItem("recordedVideo")
                URL.revokeObjectURL(url);

            }catch (e){
                console.error('Error checking for recorded video:', e);
            }
        }

        checkForRecordedVideo();
    }, [video]);

    const [error, setError] = useState('');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value} = e.target;

        setFormData((prevState) => ({ ...prevState, [name]: value }))
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);

        try{
            if(!video.file || !thumbnail.file) {
                setError('Please upload both video and thumbnail files.');
                return;
            }

            if(!formData.title || !formData.description) {
                setError('Title and description are required.');
                return;
            }

            // 0 upload the video to Bunny
            const {
                videoId,
                uploadUrl: videoUploadUrl,
                accessKey: videoAccessKey,
            } = await getVideoUploadUrl();

            if(!videoUploadUrl || !videoAccessKey) throw new Error('Failed to get video upload URL.');

            // 1 upload the video file to Bunny
            await uploadFileToBunny(video.file, videoUploadUrl, videoAccessKey);

            // 2 upload the thumbnail to DB
            const {
                cdnUrl: thumbnailCdnUrl,
                uploadUrl: thumbnailUploadUrl,
                accessKey: thumbnailAccessKey,
            } = await getThumbnailUploadUrl(videoId);

            if(!thumbnailUploadUrl || !thumbnailAccessKey || !thumbnailCdnUrl ) throw new Error('Failed to get thumbnail upload URL.');

            // 3 Attach thumbnail
            await uploadFileToBunny(thumbnail.file, thumbnailUploadUrl, thumbnailAccessKey);

            // 4 create a new video entry in the database (urls,data, metadata)
            await saveVideoDetails({
                videoId,
                thumbnailUrl: thumbnailCdnUrl,
                ...formData,
                duration: videoDuration
            })


            router.push('/');

        }catch(e){
            console.log('Upload failed:', e);

        }finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="wrapper-md upload-page">
            <h1>Upload for fun</h1>
            {error && <div className="error-field">{error}</div>}

            <form className="rounded-20 shadow-10 gap-6 w-full flex flex-col px-5 py-7.5" onSubmit={handleSubmit}>
                <FormField
                    id="title"
                    label="Title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Give your masterpiece a catchy title!"

                />

                <FormField
                    id="description"
                    label="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what this video is about!"
                    as ="textarea"

                />

                <FileInput
                    id="video"
                    label="Video"
                    accept="video/*"
                    file={video.file}
                    previewUrl={video.previewUrl}
                    inputRef={video.inputRef}
                    onChange={video.handleFileChange}
                    onReset={video.resetFile} type="video"
                />

                <FileInput
                    id="thumbnail"
                    label="Thumbnail"
                    accept="image/*"
                    file ={thumbnail.file}
                    previewUrl={thumbnail.previewUrl}
                    inputRef={thumbnail.inputRef}
                    onChange={thumbnail.handleFileChange}
                    onReset={thumbnail.resetFile}
                    type="image"
                />

                <FormField
                    id="visibility"
                    label="Visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    placeholder="Describe what this video is about!"
                    as ="select"
                    options={[
                        { value: 'public', label: 'Public' },
                        { value: 'private', label: 'Private'},
                    ]}

                />

                <button type="submit" disabled={isSubmitting} className="submit-button">
                    {isSubmitting ? 'Uploading...' : 'Upload Video'}
                </button>
            </form>


        </div>
    )
}
export default Page
