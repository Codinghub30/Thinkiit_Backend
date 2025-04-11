const Question = require("../models/questionBank");
const redis = require("redis");
const client = redis.createClient();
const fs = require("fs");
const path = require("path");

client.connect().catch(console.error);
// Create a new question
// Generate QID based on Subject
// const generateQID = async (subject) => {
//   const prefix = subject.charAt(0).toUpperCase();
//   const lastQuestion = await Question.findOne({ Subject: subject }).sort({
//     QID: -1,
//   });
//   const lastNumber = lastQuestion ? parseInt(lastQuestion.QID.substring(1)) : 0;
//   const newQID = `${prefix}${String(lastNumber + 1).padStart(6, "0")}`;
//   return newQID;
// };
exports.createQuestion = async (req, res) => {
  try {
    const {
      QID,
      Subject,
      English,
      OptionsEnglish,
      Answer,
      Hindi,
      OptionsHindi,
      Images,
      SolutionSteps,
      Language,
    } = req.body;
    if (!Subject) {
      return res.status(400).json({ message: "Subject is required" });
    }

    // Generate QID
    // const QID = await generateQID(Subject);
    const generateImageID = () => {
      const now = new Date();
      return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}${String(now.getDate()).padStart(2, "0")}_${String(
        now.getHours()
      ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
        now.getSeconds()
      ).padStart(2, "0")}${String(now.getMilliseconds()).padStart(3, "0")}`;
    };
    const imagePathRegex = /\\includegraphics\[.*?\]\{(.*?)\}/g;
    const imagePathMatches = [...English.matchAll(imagePathRegex)];
    let storedImages = {};

    imagePathMatches.forEach((match) => {
      const imagePath = match[1]; // Extract image path from LaTeX
      const fullImagePath = path.join(__dirname, "..", imagePath);

      if (fs.existsSync(fullImagePath)) {
        const base64Data = fs.readFileSync(fullImagePath, {
          encoding: "base64",
        });
        const imageID = generateImageID();
        storedImages[imageID] = base64Data;
      } else {
        console.warn(`Image file not found: ${fullImagePath}`);
      }
    });

    // Remove LaTeX image tags from question text
    const cleanedEnglish = English.replace(imagePathRegex, "").trim();

    // Handle uploaded files (if any)
    if (req.files) {
      Object.keys(req.files).forEach((key) => {
        const file = req.files[key];
        const base64Data = fs.readFileSync(file.path, { encoding: "base64" });
        const imageID = generateImageID();
        storedImages[`${imageID}`] = base64Data;
      });
    }
    // Create new question
    const newQuestion = new Question({
      ...req.body,
      QID,
      English: cleanedEnglish || English,
      OptionsEnglish: OptionsEnglish,
      Hindi: Hindi,
      OptionsHindi: OptionsHindi,
      Answer: Answer,
      SolutionSteps: SolutionSteps,
      Language: Language,
      Images: storedImages,
    });

    // Save question to database
    const savedQuestion = await newQuestion.save();
    res.status(200).json(savedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getFilteredQuestions = async (req, res) => {
  try {
    let query = {};
    console.log(req.query, "req.queryrs");
    if (req.query.uniqueCode)
      query.QID = { $regex: req.query.uniqueCode, $options: "i" };
    if (req.query.class)
      query.Class = { $regex: req.query.class, $options: "i" };
    if (req.query.subject)
      query.Subject = { $regex: req.query.subject, $options: "i" };
    if (req.query.chapter)
      query.Chapter = { $regex: req.query.chapter, $options: "i" };
    if (req.query.subChapter)
      query.Topic = { $regex: req.query.subChapter, $options: "i" };
    if (req.query.difficulty)
      query.Difficulty = { $regex: req.query.difficulty, $options: "i" };
    if (req.query.questionBank)
      query.QuestionBank = { $regex: req.query.questionBank, $options: "i" };
    if (req.query.questionType)
      query.Type = { $regex: req.query.questionType, $options: "i" };
    if (req.query.languages)
      query.Language = { $regex: req.query.languages, $options: "i" };

    console.log("Applied Filters:", query); // Debugging
    // Fetch questions based on query
    const questions = await Question.find(query);
    // console.log(questions,"questions")
    res.status(200).json({ data: questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Server Error" });
  }
};
// Get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findOne({ QID: req.params.qid });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { qid } = req.params;
    const existingQuestion = await Question.findOne({ QID: qid });

    if (!existingQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    const {
      Class: ClassName,
      Subject,
      Type,
      Chapter,
      Topic,
      Difficulty,
      English,
      OptionsEnglish,
      Hindi,
      OptionsHindi,
      Gujarati,
      OptionsGujarati,
      NoOfOptions,
      Options,
      Answer,
      SolutionSteps,
      SolutionVideo,
    } = req.body;

    const fieldsToUpdate = {
      Class: ClassName ?? existingQuestion.Class,
      Subject: Subject ?? existingQuestion.Subject,
      Type: Type ?? existingQuestion.Type,
      Chapter: Chapter ?? existingQuestion.Chapter,
      Topic: Topic ?? existingQuestion.Topic,
      Difficulty: Difficulty ?? existingQuestion.Difficulty,
      English: English ?? existingQuestion.English,
      OptionsEnglish: OptionsEnglish ?? existingQuestion.OptionsEnglish,
      Hindi: Hindi ?? existingQuestion.Hindi,
      OptionsHindi: OptionsHindi ?? existingQuestion.OptionsHindi,
      Gujarati: Gujarati ?? existingQuestion.Gujarati,
      OptionsGujarati: OptionsGujarati ?? existingQuestion.OptionsGujarati,
      NoOfOptions: NoOfOptions ?? existingQuestion.NoOfOptions,
      Options: Options ?? existingQuestion.Options,
      Answer: Answer ?? existingQuestion.Answer,
      SolutionSteps: SolutionSteps ?? existingQuestion.SolutionSteps,
      SolutionVideo: SolutionVideo ?? existingQuestion.SolutionVideo,
    };

    if (req.files && Object.keys(req.files).length > 0) {
      const storedImages = { ...existingQuestion.Images };
      Object.keys(req.files).forEach((key) => {
        const file = req.files[key];
        const base64Data = fs.readFileSync(file.path, { encoding: "base64" });
        const imageID = `img_${Date.now()}`;
        storedImages[imageID] = base64Data;
      });
      fieldsToUpdate.Images = storedImages;
    } else {
      fieldsToUpdate.Images = existingQuestion.Images;
    }

    const updatedQuestion = await Question.findOneAndUpdate(
      { QID: qid },
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(500).json({ message: "Failed to update the question" });
    }

    return res.status(200).json({
      message: "Question updated successfully.",
      updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a question by ID
exports.deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await Question.findOneAndDelete({
      QID: req.params.qid,
    });
    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFilteredQuestions = async (req, res) => {
  try {
    const {
      Chapter,
      Class: classLevel,
      Subject,
      Topic,
      Type,
      Language,
    } = req.query;
    let filter = {};
    if (Chapter)
      filter["Chapter"] = {
        $regex: new RegExp(decodeURIComponent(Chapter), "i"),
      };
    if (classLevel) filter["Class"] = { $eq: decodeURIComponent(classLevel) };
    if (Subject)
      filter["Subject"] = {
        $regex: new RegExp(decodeURIComponent(Subject), "i"),
      };
    if (Topic)
      filter["Topic"] = { $regex: new RegExp(decodeURIComponent(Topic), "i") };
    if (Type)
      filter["Type"] = { $regex: new RegExp(decodeURIComponent(Type), "i") };
    if (Language)
      filter["Language"] = {
        $regex: new RegExp(decodeURIComponent(Language), "i"),
      };
    const questions = await Question.find(filter);
    console.log("questions", questions);

    if (!questions?.length) {
      console.log("No questions found for the given filter.");
      return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error("Error fetching filtered questions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// getquestion class
exports.getQuestionsByClass = async (req, res) => {
  try {
    const { className } = req.query;
    if (!className) {
      return res.status(400).json({ message: "Class name is required" });
    }
    const questions = await Question.find({ Class: className });
    if (questions?.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this class" });
    }
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getQuestionsBySubject = async (req, res) => {
  try {
    const { Subject } = req.query;
    if (!Subject) {
      return res.status(400).json({ message: "Subject name is required" });
    }
    const questions = await Question.find({ Subject: Subject });
    if (questions?.length === 0) {
      return res
        .status(400)
        .json({ message: "No questions found for this Subject" });
    }
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getQuestionsBylanguage = async (req, res) => {
  try {
    const { Language } = req.query;
    if (!Language) {
      return res.status(400).json({ message: "Language name is required" });
    }
    const questions = await Question.find({ Language: Language });
    if (questions?.length === 0) {
      return res
        .status(400)
        .json({ message: "No questions found for this Language" });
    }
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
