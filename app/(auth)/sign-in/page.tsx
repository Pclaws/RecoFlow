'use client';

import React from 'react'
import Link from "next/link";
import Image from "next/image";
import {authClient} from "@/lib/auth-client";

const Page = () => {

    const handleSignIn = async () => {
        return await authClient.signIn.social({provider: 'google'});
    }

    return (
        <main className="sign-in">
            <aside className="testimonial">
                <Link href="/">
                    <Image src="/assets/icons/mylogo.svg" alt="logo" width={32} height={32} />
                    <h1>recoFlow</h1>
                </Link>

                <div className="description">
                    <section>
                        <figure>
                            {Array.from({length: 5}).map((_, index) => (
                                <Image src="/assets/icons/star.svg" alt="star" width={20} height={20} key={index} />
                            ))}
                        </figure>

                        <p>"RecoFlow has completely transformed the way you discover and share videos.
                            The intuitive interface and personalized recommendations make it the go-to platform every day!"
                        </p>

                        <article>
                            <Image src="/assets/images/jason.png" alt="ceasar" width={64} height={64} className="rounded-full" />

                            <div>
                                <h2>
                                    Ceasar Momoah.
                                </h2>
                                <p>Product Designer, AbcByte</p>
                            </div>

                        </article>
                    </section>
                </div>
                <p>© RecoFlow {(new Date()).getFullYear()}</p>
            </aside>

            <aside className="google-sign-in">
                <section>
                    <Link href="/">
                        <Image src="/assets/icons/mylogo.svg" alt="logo" width={40} height={40} />
                        <h1>RecoFlow</h1>
                    </Link>

                    <p>Unleash your creativity—share your first <span>RecoFlow video</span> and inspire others!</p>

                    <button onClick={handleSignIn}>
                        <Image src="/assets/icons/google.svg" alt="google" width={22} height={22} />
                        <span>Sign in with Google</span>
                    </button>
                </section>
            </aside>

            <div className="overlay" />
        </main>
    )
}
export default Page
