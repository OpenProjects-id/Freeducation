import { writable } from 'svelte/store';

export const crowdfundings = writable([]);
export const crowdfunding = writable({});

export async function getCrowdfundings() {
    const res = await fetch("https://freeducation-api.herokuapp.com/crowdfundings");
    const data = await res.json();
    crowdfundings.set(data);

    if (res.ok) {
        return data;
    } else {
        throw new Error(data);
    }
}

export async function getCrowdfunding(id) {
    const res = await fetch(
        `https://freeducation-api.herokuapp.com/crowdfundings/${id}`
    );
    const data = await res.json();
    crowdfunding.set(data);

    if (res.ok) {
        return data;
    } else {
        throw new Error(data);
    }
}

getCrowdfundings();