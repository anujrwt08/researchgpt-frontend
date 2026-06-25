/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Paper, PaperInsights, PaperComparison, Citation, QuizQuestion, ResearchReport, KnowledgeGraph, ChatMessage, DashboardStats } from './types';

export const MOCK_PAPERS: Paper[] = [
  {
    paper_name: "Attention Is All You Need",
    uploaded_by: "demo@researchgpt.ai",
    chunks: 48,
    vector_path: "chroma_db/Attention_Is_All_You_Need",
    upload_date: "2026-06-20",
    file_size: "2.1 MB",
    pages: 15
  },
  {
    paper_name: "Retrieval-Augmented Generation for Knowledge-Intensive Tasks",
    uploaded_by: "demo@researchgpt.ai",
    chunks: 62,
    vector_path: "chroma_db/RAG_Knowledge_Intensive",
    upload_date: "2026-06-22",
    file_size: "1.8 MB",
    pages: 18
  },
  {
    paper_name: "Llama 3: Open Foundation and Fine-Tuned Chat Models",
    uploaded_by: "demo@researchgpt.ai",
    chunks: 112,
    vector_path: "chroma_db/Llama_3_Open_Foundation",
    upload_date: "2026-06-24",
    file_size: "4.5 MB",
    pages: 42
  }
];

export const MOCK_INSIGHTS: Record<string, PaperInsights> = {
  "Attention Is All You Need": {
    main_contributions: [
      "Introduction of the Transformer architecture, the first sequence transduction model relying entirely on self-attention.",
      "Elimination of recurrent (RNN/LSTM) and convolutional (CNN) architectures for sequence processing, allowing superior parallelization.",
      "Achieved state-of-the-art results on English-to-German and English-to-French translation tasks with significantly reduced training costs."
    ],
    methodology: "The Transformer relies on scaled dot-product attention and multi-head attention. Instead of processing tokens sequentially, it utilizes positional encodings to capture order. The model consists of an encoder-decoder stack with residual connections, layer normalization, and fully connected feed-forward networks.",
    limitations: [
      "Quadratic computational complexity (O(N^2)) with respect to sequence length N, making it highly resource-intensive for long contexts.",
      "Requires massive datasets to generalize properly, unlike inductive biases present in CNNs or RNNs.",
      "Lacks direct temporal modeling, requiring manual positional encodings."
    ],
    novelty_score: 98,
    key_findings: [
      "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.",
      "Self-attention layers have shorter path lengths than recurrence, which makes it significantly easier to learn long-range dependencies.",
      "Scaled attention outperforms simple dot-product attention on large dimensions by preventing vanishing gradients in the softmax."
    ]
  },
  "Retrieval-Augmented Generation for Knowledge-Intensive Tasks": {
    main_contributions: [
      "Pioneered Retrieval-Augmented Generation (RAG) by combining pre-trained parametric memory (seq2seq models) with non-parametric memory (Wikipedia vector index).",
      "Created a unified end-to-end differentiable framework for retrieval and generation.",
      "Showed that combining retrieval with generation substantially reduces hallucinations and increases factual accuracy."
    ],
    methodology: "RAG integrates a dense passage retriever (DPR) to fetch relevant document embeddings and a seq2seq generator (BART) to synthesize responses. It introduces two formulations: RAG-Token (retrieves documents per generated token) and RAG-Sequence (retrieves documents once for the entire generation).",
    limitations: [
      "High retrieval latency due to dense index searching during inference.",
      "Relies heavily on the quality of retriever; if relevant documents are missed, the generator cannot synthesize correct facts.",
      "Challenging to fine-tune both retrieval and generation layers simultaneously in real-world large-scale settings."
    ],
    novelty_score: 92,
    key_findings: [
      "RAG models outperform pure parametric models (like T5 or GPT-3) on open-domain QA tasks while using a fraction of the parameters.",
      "Generating answers based on real documents provides an automatic audit trail, allowing developers to trace citations back to source paragraphs.",
      "Parametric-only models struggle with highly specific, dynamic, or private enterprise knowledge bases."
    ]
  },
  "Llama 3: Open Foundation and Fine-Tuned Chat Models": {
    main_contributions: [
      "Development of a family of high-performance LLMs (8B, 70B, and 405B parameters) that rival leading proprietary models.",
      "Pre-trained on a massive corpus of 15 trillion tokens, demonstrating that models continue to learn and improve long after conventional compute-optimal limits.",
      "Introduced detailed alignment methodologies utilizing Grouped-Query Attention (GQA), supervised fine-tuning (SFT), and Reinforcement Learning from Human Feedback (RLHF)."
    ],
    methodology: "Utilizes a standard decoder-only Transformer structure but incorporates several optimizations: SwiGLU activation functions, Rotary Positional Embeddings (RoPE), Grouped-Query Attention to reduce key-value cache memory footprints, and a larger 128k token vocabulary. Trained using customized massive GPU clusters with multi-dimensional parallelism.",
    limitations: [
      "Extremely expensive pre-training stage requiring tens of thousands of H100 GPUs.",
      "The 405B parameter model requires complex model parallel setups, making local deployment impossible for small startups.",
      "Still susceptible to subtle reasoning errors and edge-case hallucinations despite extensive safety guarding."
    ],
    novelty_score: 85,
    key_findings: [
      "Scaling the pre-training data by orders of magnitude (to 15T tokens) yields continuous capabilities gains, bypassing the Chinchilla scaling bounds.",
      "Grouped-Query Attention significantly increases token generation throughput without sacrificing accuracy.",
      "Iterative DPO (Direct Preference Optimization) and PPO (Proximal Policy Optimization) steps dramatically improve model instruction-following and safety alignment."
    ]
  }
};

export const MOCK_CHAT_HISTORY: Record<string, ChatMessage[]> = {
  "Attention Is All You Need": [
    {
      paper: "Attention Is All You Need",
      question: "What is Multi-Head Attention?",
      answer: "Multi-head attention is a core mechanism in the Transformer. Instead of performing a single attention function with d-dimensional queries, keys, and values, the authors found it beneficial to linearly project the queries, keys, and values h times with different, learned linear projections. On each of these projected versions of queries, keys, and values we then perform the attention function in parallel, yielding h-dimensional output values. These are concatenated and once again projected, resulting in the final values. This allows the model to jointly attend to information from different representation subspaces at different positions.",
      created_at: "2026-06-20T14:32:00Z"
    },
    {
      paper: "Attention Is All You Need",
      question: "Why did they replace LSTMs?",
      answer: "They replaced LSTMs primarily for two reasons:\n1. **Parallelization**: LSTMs are inherently sequential; they process tokens one by one, which limits parallel training on GPUs. The Transformer processes all tokens in parallel, vastly increasing throughput.\n2. **Long-range Dependencies**: LSTMs struggle to retain information across very long distances due to vanishing gradients. The Self-Attention mechanism provides direct path connections between any two tokens in the sequence, making the path length O(1).",
      created_at: "2026-06-20T14:35:10Z"
    }
  ],
  "Retrieval-Augmented Generation for Knowledge-Intensive Tasks": [
    {
      paper: "Retrieval-Augmented Generation for Knowledge-Intensive Tasks",
      question: "What is the difference between RAG-Sequence and RAG-Token?",
      answer: "The paper proposes two models:\n\n1. **RAG-Sequence Model**: Retrieves a set of top-K documents once, and then uses these same documents to generate the entire target sequence. It is best suited for cohesive, single-focused text generation.\n\n2. **RAG-Token Model**: Retrieves a different set of top-K documents for **each individual token** in the target sequence. This allows the generator to synthesize information from multiple different documents sequentially, making it incredibly powerful for multi-hop reasoning or detailed lists.",
      created_at: "2026-06-22T09:12:00Z"
    }
  ]
};

export const MOCK_CITATIONS: Record<string, Citation[]> = {
  "Attention Is All You Need": [
    {
      citation: "Bahdanau et al., 2014",
      authors: "Dzmitry Bahdanau, Kyunghyun Cho, Yoshua Bengio",
      year: 2014,
      context: "Neural machine translation using joint learning to align and translate, which introduced attention to deep learning.",
      confidence: 0.98
    },
    {
      citation: "Sukhbaatar et al., 2015",
      authors: "Sainbayar Sukhbaatar, Arthur Szlam, Jason Weston, Rob Fergus",
      year: 2015,
      context: "End-to-end memory networks, which explored recurrent attention models over external storage.",
      confidence: 0.88
    },
    {
      citation: "Vaswani et al., 2017",
      authors: "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin",
      year: 2017,
      context: "This paper itself, setting the core benchmark for self-attention.",
      confidence: 1.00
    }
  ]
};

export const MOCK_REPORTS: Record<string, ResearchReport> = {
  "Attention Is All You Need": {
    executive_summary: "This report critiques the landmark paper 'Attention Is All You Need', which revolutionized modern AI. By removing recurrence altogether and relying solely on self-attention, the paper unlocked massive computational efficiencies and set the stage for all modern large language models, including GPT-4, Gemini, and Claude.",
    technical_contributions: "1. Developed the Scaled Dot-Product Attention mechanism.\n2. Introduced Multi-Head Attention to capture diverse linguistic and contextual features.\n3. Designed positional encodings (sine and cosine wave forms) to preserve token order in parallel computing.",
    methodology_critique: "The methodology is exceptionally elegant but relies heavily on vast compute resources. It operates on a static sequence window (originally 512 tokens), which means context is dropped beyond this limit. The training hyperparameter settings are tailored highly to the WMT datasets, requiring substantial modifications for generalized pretraining.",
    suggested_extensions: [
      "Linear attention approximations (like FlashAttention) to reduce the O(N^2) complexity to O(N).",
      "Dynamic positional embeddings (like RoPE or Alibi) to support infinite context lengths.",
      "Sparse attention grids to selectively process dense structures, saving memory."
    ],
    conclusion: "The Transformer is indisputably the most influential architecture of the decade. It shifted the NLP paradigm from sequential recurrence to massively parallelizable multi-head attention arrays, initiating the generative AI era."
  }
};

export const MOCK_QUIZZES: Record<string, QuizQuestion[]> = {
  "Attention Is All You Need": [
    {
      id: "q1",
      question: "Which component of the Transformer model is used to inject sequence order information?",
      options: [
        "Recurrent memory cells",
        "Positional Encodings",
        "Layer Normalization lines",
        "Residual projection gates"
      ],
      correctAnswer: 1,
      explanation: "Since the Transformer lacks recurrence or convolution, it has no inherent sense of token order. Positional Encodings are added directly to the input embeddings to convey word order."
    },
    {
      id: "q2",
      question: "What is the mathematical complexity of a self-attention layer with respect to sequence length N?",
      options: [
        "O(N)",
        "O(N log N)",
        "O(N^2)",
        "O(2^N)"
      ],
      correctAnswer: 2,
      explanation: "Each token must compute an attention score with every other token in the sequence, leading to a quadratic complexity of O(N^2) in computation and memory."
    },
    {
      id: "q3",
      question: "Why is dot-product attention scaled by 1/sqrt(d_k)?",
      options: [
        "To compress the query vector size",
        "To speed up matrix multiplication",
        "To avoid extremely small dot products",
        "To prevent extremely large dot products which push the softmax into vanishing gradient regions"
      ],
      correctAnswer: 3,
      explanation: "For large values of key dimension d_k, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients. Dividing by sqrt(d_k) scales the variance back to 1."
    }
  ]
};

export const MOCK_GRAPHS: Record<string, KnowledgeGraph> = {
  "Attention Is All You Need": {
    nodes: [
      { id: "transformer", label: "Transformer Model", type: "concept" },
      { id: "self_att", label: "Self-Attention", type: "concept" },
      { id: "multi_head", label: "Multi-Head Attention", type: "method" },
      { id: "pos_enc", label: "Positional Encoding", type: "method" },
      { id: "bleu", label: "BLEU Score", type: "metric" },
      { id: "vaswani", label: "Ashish Vaswani", type: "author" }
    ],
    links: [
      { source: "transformer", target: "self_att", label: "relies on" },
      { source: "self_att", target: "multi_head", label: "expanded into" },
      { source: "transformer", target: "pos_enc", label: "retains order via" },
      { source: "transformer", target: "bleu", label: "evaluated with" },
      { source: "vaswani", target: "transformer", label: "authored" }
    ]
  }
};

export const GENERAL_MOCK_INSIGHTS = (title: string): PaperInsights => ({
  main_contributions: [
    `Novel methodology applied to the core research question in ${title}.`,
    "Identified several critical benchmarks and outperformed state-of-the-art baselines.",
    "Provided open-source code and pre-trained datasets for the scientific community."
  ],
  methodology: `The research constructs a rigorous computational framework utilizing comparative analysis, robust validation criteria, and deep learning neural architectures optimized with high-performance hyperparameter tuning.`,
  limitations: [
    "Evaluated on a relatively narrow set of specialized benchmarks.",
    "Requires substantial GPU hours to achieve comparable performance margins.",
    "Vulnerable to distribution shifts outside of the training domain."
  ],
  novelty_score: 78,
  key_findings: [
    "Integrating contextual embeddings results in an average 12% accuracy improvement.",
    "Inference latencies are tightly correlated with sequence length parameters.",
    "Pre-training alignment procedures drastically reduce toxic or irrelevant system behaviors."
  ]
});

export const GENERAL_MOCK_QUIZ = (title: string): QuizQuestion[] => [
  {
    id: "q1",
    question: `What is the primary thesis of the paper "${title}"?`,
    options: [
      "To replace neural architectures with pure mathematical formulas.",
      "To present a novel, high-performance optimization strategy for research workflows.",
      "To outline a historical retrospective on classical natural language pipelines.",
      "To detail hardware assembly configurations for supercomputer nodes."
    ],
    correctAnswer: 1,
    explanation: "The paper proposes a novel computational strategy designed to exceed previous benchmarks on research efficiency."
  },
  {
    id: "q2",
    question: "Which of these is highlighted as a critical limitation in the paper's methodology?",
    options: [
      "The dataset is excessively large for standard filesystems.",
      "High compute requirements and narrow evaluation domains.",
      "Complete lack of a validation control group.",
      "The code was written in a non-standard programming framework."
    ],
    correctAnswer: 1,
    explanation: "As with many deep learning papers, high resource costs and domain specificity are noted constraints."
  }
];

export const GENERAL_MOCK_GRAPH = (title: string): KnowledgeGraph => {
  const shortName = title.slice(0, 15) + "...";
  return {
    nodes: [
      { id: "core_paper", label: shortName, type: "concept" },
      { id: "neural_net", label: "Neural Network Architecture", type: "concept" },
      { id: "rag_pipeline", label: "RAG Pipeline Integrations", type: "method" },
      { id: "evaluation", label: "Ablation Studies", type: "method" },
      { id: "accuracy", label: "F1 Score & Accuracy", type: "metric" }
    ],
    links: [
      { source: "core_paper", target: "neural_net", label: "implements" },
      { source: "neural_net", target: "rag_pipeline", label: "interfaces with" },
      { source: "core_paper", target: "evaluation", label: "validates via" },
      { source: "evaluation", target: "accuracy", label: "measures" }
    ]
  };
};

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  total_users: 142,
  total_papers: 450,
  total_questions: 1892
};
