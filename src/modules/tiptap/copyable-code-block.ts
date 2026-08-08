import CodeBlock from '@tiptap/extension-code-block';
import type {Node as ProseMirrorNode} from '@tiptap/pm/model';

interface CopyableCodeBlockLabels {
    copy: string;
    copied: string;
}

const copyText = async (text: string): Promise<boolean> => {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {

    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
};

export const createCopyableCodeBlock = (labels: CopyableCodeBlockLabels) => CodeBlock.extend({
    addNodeView() {
        return ({node}) => {
            let currentNode: ProseMirrorNode = node;
            let resetTimer: ReturnType<typeof setTimeout> | undefined;

            const pre = document.createElement('pre');
            pre.classList.add('code-block-with-copy');

            const button = document.createElement('button');
            button.type = 'button';
            button.classList.add('code-copy-button');
            button.contentEditable = 'false';
            button.setAttribute('aria-label', labels.copy);
            button.title = labels.copy;

            const icon = document.createElement('i');
            icon.className = 'pi pi-copy';
            icon.setAttribute('aria-hidden', 'true');

            const label = document.createElement('span');
            label.textContent = labels.copy;

            const code = document.createElement('code');
            button.append(icon, label);
            pre.append(button, code);

            const updateLanguage = () => {
                const language = currentNode.attrs.language;
                code.className = language ? `language-${language}` : '';
            };

            const resetButton = () => {
                icon.className = 'pi pi-copy';
                label.textContent = labels.copy;
                button.setAttribute('aria-label', labels.copy);
                button.title = labels.copy;
            };

            button.addEventListener('mousedown', event => event.preventDefault());
            button.addEventListener('click', async event => {
                event.preventDefault();
                event.stopPropagation();

                if (!await copyText(currentNode.textContent))
                    return;

                icon.className = 'pi pi-check';
                label.textContent = labels.copied;
                button.setAttribute('aria-label', labels.copied);
                button.title = labels.copied;

                if (resetTimer) clearTimeout(resetTimer);
                resetTimer = setTimeout(resetButton, 2000);
            });

            updateLanguage();

            return {
                dom: pre,
                contentDOM: code,
                update(updatedNode) {
                    if (updatedNode.type !== currentNode.type)
                        return false;

                    currentNode = updatedNode;
                    updateLanguage();
                    return true;
                },
                ignoreMutation(mutation) {
                    return !code.contains(mutation.target);
                },
                destroy() {
                    if (resetTimer) clearTimeout(resetTimer);
                },
            };
        };
    },
});
