import Fab from '@mui/material/Fab';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useCallback, useRef } from 'react';
import { enableMapSet } from "immer";
import { useImmer } from "use-immer";
import styles from '@/styles/App.module.css';
enableMapSet();

const validate = (json) => {
	if (!Array.isArray(json)){
		return false;
	}

	if(json.some((value) =>
		typeof value.word !== 'string' ||
		typeof value.part !== 'string' ||
		typeof value.note !== 'string'
	)){
		return false;
	}

	return true;
};

const vocabToJSON = (vocab) => {
	const array = [...vocab.values()];
	return JSON.stringify(array);
};

const shuffle = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		// The target can be i itself
		const target = Math.floor(Math.random() * (i + 1));
		[array[i], array[target]] = [array[target], array[i]];
	}
};

export default function App(){
	const [state, updateState] = useImmer({
		vocab: new Map(),
		order: []
	});
	const wordRef = useRef(null);
	const partRef = useRef(null);
	const noteRef = useRef(null);

	const addWord = useCallback((draft, voc) => {
		let randomID;
		do {
			randomID = Math.random().toString();
		} while (draft.vocab.has(randomID));

		draft.vocab.set(randomID, voc);
		draft.order.push(randomID);
	}, []);

	const handleUpload = useCallback((e) => {
		const file = e.target.files[0];
		// Clear input filename
		e.target.value = "";
		if (file === undefined) {
			return;
		}

		const reader = new FileReader();
		reader.onload = async (e) => {
			const json = JSON.parse(e.target.result);
			if (!validate(json)){
				return;
			}
			// Rerender before update
			updateState({
				vocab: new Map(),
				order: []
			});
			// Update
			updateState((draft) => {
				for(const voc of json){
					addWord(draft, voc)
				}
				// Shuffle
				shuffle(draft.order);
			});
		};
		reader.readAsText(file);
	}, [addWord, updateState]);

	const handleShuffle = useCallback(() => {
		updateState((draft) => {
			shuffle(draft.order);
		})
	}, [updateState]);

	const handleAdd = useCallback(() => {
		const word = (wordRef.current.value !== undefined) ? wordRef.current.value.trim() : "";
		const part = (partRef.current.value !== undefined) ? partRef.current.value.trim() : "";
		const note = (noteRef.current.value !== undefined) ? noteRef.current.value.trim() : "";
		wordRef.current.value = '';
		partRef.current.value = '';
		noteRef.current.value = '';
		if(word === part && word === note && word === ''){
			return;
		}

		updateState((draft) => {
			addWord(draft, {word, part, note});
		});
	}, [wordRef, partRef, noteRef, updateState, addWord]);

	const handleDelete = useCallback((id, index) => {
		updateState((draft) => {
			draft.vocab.delete(id);
			draft.order.splice(index, 1);
		});
	}, [updateState]);

	return (<>
		<Stack className={styles['fab-div']} justifyContent="space-around" >
			<Tooltip title="Upload" placement="bottom-start">
				<Fab
					color="primary"
					aria-label="Upload"
					className={styles.fab}
					component="label"
				>
					<FileUploadIcon />
					<input type="file" accept="application/json" hidden onChange={handleUpload} />
				</Fab>
			</Tooltip>
			<Tooltip title="Download" placement="bottom-start">
				<Fab
					color="primary"
					aria-label="Download"
					className={styles.fab}
					component="a"
					href={`data:text/json;chatset=utf-8,${encodeURIComponent(vocabToJSON(state.vocab))}`}
					download="vocab.json"
				>
					<FileDownloadIcon />
				</Fab>
			</Tooltip>
			<Tooltip title="Shuffle" placement="bottom-start">
				<Fab
					color="primary"
					aria-label="Shuffle"
					className={styles.fab}
					onClick={handleShuffle}
				>
					<ShuffleIcon />
				</Fab>
			</Tooltip>
		</Stack>
		<Stack className={styles['word-list']}>
			{
				state.order.map((id, index) => {
					const voc = state.vocab.get(id);
					return (
						<Stack key={id} direction="row">
							<Stack className={styles['word-box']} direction="row" alignItems="center">
								<span className={styles.word}>{voc.word}</span>
								<span className={styles.part}>{voc.part}</span>
								<span className={styles.note}>{voc.note}</span>
							</Stack>
							<IconButton
								color="secondary"
								aria-label={`Delete the word ${voc.word}`}
								onClick={() => handleDelete(id, index)}
							>
								<DeleteIcon />
							</IconButton>
						</Stack>
					);
				})
			}
		</Stack>
		<div className={styles.input}>
			<TextField inputRef={wordRef} label="Word" variant="outlined" />
			<TextField inputRef={partRef} label="Part of speech" variant="outlined" />
			<TextField inputRef={noteRef} label="Note (meaning)" variant="outlined" multiline />
			<IconButton color="primary" aria-label="Add a word" onClick={handleAdd} ><AddIcon /></IconButton>
		</div>
	</>);
}