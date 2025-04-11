const Question = require("../models/questionBank");
const redis = require("redis");
const client = redis.createClient();
const fs = require("fs");
const path = require("path");
const AutoPick = require("../models/AutoPick");
const mongoose = require("mongoose");

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
// exports.updateQuestion = async (req, res) => {
//   try {
//     const updatedQuestion = await Question.findOneAndUpdate(
//       { QID: req.params.qid },
//       req.body,
//       { new: true }
//     );
//     if (!updatedQuestion) {
//       return res.status(404).json({ message: "Question not found" });
//     }
//     res.status(200).json(updatedQuestion);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

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
    const filterKey = JSON.stringify(req.query);
    const cachedData = await client.get(filterKey);

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const filter = {};
    if (req.query.Class) filter.Class = req.query.Class;
    if (req.query.Subject) filter.Subject = req.query.Subject;
    if (req.query.Type) filter.Type = req.query.Type;
    if (req.query.Chapter) filter.Chapter = req.query.Chapter;
    if (req.query.SubChapter) filter.SubChapter = req.query.SubChapter;

    const questions = await Question.find(filter)
      .select("QID Class Subject Type Chapter SubChapter English Answer")
      .limit(50)
      .lean();

    console.timeEnd("DB Query Time");

    if (questions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found with the given filters." });
    }

    // Cache result for 10 minutes
    await client.set(filterKey, JSON.stringify(questions), { EX: 600 });

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.bulkUploadQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: "Invalid data format. Provide a non-empty array of questions.",
      });
    }
    const insertedQuestions = await Question.insertMany(questions);

    res.status(201).json({
      message: "Questions uploaded successfully",
      insertedCount: insertedQuestions.length,
      insertedQuestions,
    });
  } catch (error) {
    console.error("Error uploading questions:", error);

    let errorMessage = "An error occurred while uploading questions";
    if (error.name === "ValidationError") {
      errorMessage = "Invalid question data provided.";
    } else if (error.code === 11000) {
      errorMessage = "Duplicate entries found in the questions list.";
    }

    res.status(500).json({
      message: errorMessage,
      error: error.message,
    });
  }
};

exports.getFilteredQuestionsforTest = async (req, res) => {
  try {
    const filter = {};

    // Filtering by standard fields
    if (req.body.Class) filter.Class = req.body.Class;
    if (req.body.Subject) filter.Subject = req.body.Subject;
    if (req.body.Type) filter.Type = req.body.Type;
    if (req.body.questionType) filter.Type = req.body.questionType;

    // Filtering by chapter (assuming it's an array in MongoDB)
    if (req.body.chapter) {
      let chapterArray = Array.isArray(req.body.chapter)
        ? req.body.chapter
        : [req.body.chapter];
      filter.Chapter = { $in: chapterArray };
    }

    // Filtering by topic (direct string match, NOT nested)
    if (req.body.Topic) {
      let topicArray = [];

      try {
        // Parse topic array from string if necessary
        topicArray =
          typeof req.body.Topic === "string"
            ? JSON.parse(req.body.Topic)
            : req.body.Topic;
      } catch (error) {
        return res.status(400).json({ message: "Invalid Topic format" });
      }

      if (Array.isArray(topicArray) && topicArray.length > 0) {
        filter.Topic = { $in: topicArray.map((t) => t.topicName) }; // Use 'Topic' field
      }
    }

    const questions = await Question.find(filter)
      // .select("QID Class Subject Type Chapter SubChapter English Answer Topic") // Select 'Topic' not 'topic'
      .limit(50)
      .lean();

    if (questions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found with the given filters." });
    }

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Auto Pick Questions
exports.autoPickQuestions = async (req, res) => {
  try {
    const { testId, sectionId, topics, totalQuestions } = req.body;
    const allTopicNames = topics.map((t) => t.topicName.trim());

    // Get all questions that match the selected topics
    const questions = await Question.find({
      Topic: { $in: allTopicNames },
    });

    // Group questions by topic
    const groupedByTopic = {};
    questions.forEach((q) => {
      const topic = q.Topic.trim();
      if (!groupedByTopic[topic]) {
        groupedByTopic[topic] = [];
      }
      groupedByTopic[topic].push(q);
    });

    const selectedQuestions = {};

    for (const topic of topics) {
      const topicName = topic.topicName.trim();
      const requiredQuestions = topic.numberOfQuestions;

      // if (!groupedByTopic[topicName] || groupedByTopic[topicName].length < requiredQuestions) {
      //   return res.status(400).json({
      //     success: false,
      //     message: `Not enough questions available for topic: ${topicName}.`
      //   });
      // }x

      // Shuffle the questions for this topic
      const shuffled = (groupedByTopic[topicName] || []).slice();

      for (let i = shuffled?.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      selectedQuestions[topicName] = shuffled.slice(0, requiredQuestions);
    }

    const grouped = {};

    for (const topicName in selectedQuestions) {
      grouped[topicName] = {};
      selectedQuestions[topicName].forEach((q) => {
        grouped[topicName][q._id] = true;
      });
    }

    const data = {
      testId,
      sectionId,
      questions: grouped,
    };
    console.log(data);

    // Save to the database
    await AutoPick.findOneAndUpdate({ testId, sectionId }, data, {
      upsert: true,
      new: true,
    });

    // Respond with success
    res.status(200).json({ success: true, data: grouped });
  } catch (err) {
    console.error("Auto Pick Error:", err);
    res.status(500).json({ success: false, message: "Auto Pick Failed" });
  }
};

// exports.getAutoPickedQuestions = async (req, res) => {
//   try {
//     const { testId } = req.params;
//     const pickedData = await AutoPick.find({ testId });

//     const structured = {};

//     pickedData.forEach(({ sectionId, questions }) => {
//       structured[sectionId] = questions;
//     });

//     res.status(200).json({ success: true, data: structured });
//   } catch (err) {
//     console.error("Fetch Auto Pick Error:", err);
//     res.status(500).json({ success: false, message: "Could not fetch auto picked questions." });
//   }
// };

exports.fetchThequestionsWithIDS = async (req, res) => {
  const { questionIds } = req.body;

  console.log("Original questionIds:", questionIds);

  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid or empty questionIds array." });
  }

  // Filter valid question IDs
  const validQuestionIds = questionIds.filter(
    (id) => id && mongoose.Types.ObjectId.isValid(id)
  );

  console.log("Filtered validQuestionIds:", validQuestionIds);

  if (validQuestionIds.length === 0) {
    return res.status(400).json({ message: "No valid question IDs provided." });
  }

  try {
    const questions = await Question.find({
      _id: { $in: validQuestionIds },
    });

    res.status(200).json({
      questions,
    });
  } catch (error) {
    console.error("Error fetching questions by IDs:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// New APi

exports.fetchThechapterTopicsWithIDS = async (req, res) => {
  try {
    const { qids } = req.body;

    console.log("qids", qids);

    if (!qids || !Array.isArray(qids)) {
      return res.status(400).json({ message: "qids must be an array" });
    }

    // Only fetch the necessary fields
    const questions = await Question.find(
      { QID: { $in: qids } },
      {
        QID: 1,
        Chapter: 1,
        Topic: 1,
        Subject: 1,
        Type: 1,
        Difficulty: 1,
        _id: 0,
      }
    );

    res.json({ success: true, data: questions });
  } catch (err) {
    console.log("err.message }", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// exports.autopickquestions = async (req, res) => {
//   try {
//     const filter = {};

//     if (req.body.Class) filter.Class = req.body.Class;
//     if (req.body.Subject) filter.Subject = req.body.Subject;
//     if (req.body.Type) filter.Type = req.body.Type;
//     if (req.body.questionType) filter.Type = req.body.questionType;

//     if (req.body.chapter) {
//       let chapterArray = Array.isArray(req.body.chapter)
//         ? req.body.chapter
//         : [req.body.chapter];
//       filter.Chapter = { $in: chapterArray };
//     }

//     if (req.body.topic && Array.isArray(req.body.topic)) {
//       let allQuestions = [];

//       for (const topicObj of req.body.topic) {
//         if (!topicObj.topicName || !topicObj.numberOfQuestions) {
//           return res.status(400).json({ message: "Invalid topic format" });
//         }

//         const topicQuestions = await Question.find({
//           Topic: topicObj.topicName,
//         })
//           .limit(topicObj.numberOfQuestions)
//           .lean();

//         allQuestions = [...allQuestions, ...topicQuestions];
//       }

//       if (allQuestions.length === 0) {
//         return res
//           .status(404)
//           .json({ message: "No questions found with the given filters." });
//       }

//       return res.status(200).json(allQuestions);
//     } else {
//       return res
//         .status(400)
//         .json({ message: "Invalid topic format, expected an array." });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
