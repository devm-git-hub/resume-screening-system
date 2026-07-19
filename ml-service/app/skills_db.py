"""
app/skills_db.py

A curated technical-skills taxonomy used for dictionary-based skill
extraction (complements the spaCy NER pass). In production this would
be backed by a database table so recruiters/admins can extend it
without redeploying the service.
"""

TECH_SKILLS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl", "dart",

    # Web / Frontend
    "html", "css", "react", "react.js", "angular", "vue", "vue.js", "next.js",
    "redux", "tailwind", "tailwind css", "bootstrap", "jquery", "sass", "webpack",

    # Backend
    "node.js", "express", "express.js", "django", "flask", "fastapi", "spring",
    "spring boot", "ruby on rails", ".net", "asp.net", "graphql", "rest api",

    # Databases
    "mongodb", "mysql", "postgresql", "sql", "nosql", "redis", "sqlite",
    "oracle", "cassandra", "dynamodb", "firebase",

    # ML / AI / Data
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "opencv", "spacy", "huggingface", "transformers",
    "bert", "sentence-bert", "sbert", "llm", "generative ai", "data analysis",
    "data science", "data visualization", "tableau", "power bi", "excel",

    # DevOps / Cloud
    "docker", "kubernetes", "aws", "azure", "gcp", "google cloud", "ci/cd",
    "jenkins", "terraform", "ansible", "linux", "git", "github", "gitlab",
    "render", "vercel", "netlify", "nginx",

    # Testing
    "jest", "mocha", "chai", "selenium", "cypress", "pytest", "junit",

    # Soft / Methodology
    "agile", "scrum", "jira", "project management", "team leadership",
    "communication", "problem solving",
}

DEGREE_KEYWORDS = [
    "b.tech", "btech", "b.e", "be", "bachelor", "m.tech", "mtech", "master",
    "msc", "m.sc", "bsc", "b.sc", "mca", "bca", "phd", "diploma", "mba",
    "bachelor of", "master of", "associate degree",
]
