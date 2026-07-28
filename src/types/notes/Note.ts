export type Note = {
    id: string,
    title: string,
    content: string,
    createdAt: Date,
    updatedAt: Date,
    isPinned: boolean,
    isArchived: boolean
}

export type UpdateNote = {
    title: string,
    content: string,
    idSubdomain: string | null,
    idNote: string | null,
}
