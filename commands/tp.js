const { EmbedBuilder } = require("discord.js");
const moment = require("moment");

function leapYear(year) {
  return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}

function decade() {
  const timeNow = moment();
  const yearsToAdd = 10 - (timeNow.format("YY") % 10);
  const nextDecade = moment().add(yearsToAdd, "year").startOf("year");
  let diffYear = moment(nextDecade).diff(timeNow);
  let tillNextDecade = moment.duration(diffYear).as("days");
  let decadePercentage = (3650 - tillNextDecade) / 3650;
  return Math.floor(decadePercentage * 100) + "%";
}

function year() {
  const timeNow = moment();
  const nextYear = moment().add(1, "year").startOf("year");
  let diffYear = moment(nextYear).diff(timeNow);
  let tillNextYear = moment.duration(diffYear).as("hours");
  let yearPercentage;
  if (leapYear(timeNow.format("YYYY"))) {
    yearPercentage = (24 * 366 - tillNextYear) / (24 * 366);
  } else {
    yearPercentage = (24 * 365 - tillNextYear) / (24 * 365);
  }
  return Math.floor(yearPercentage * 100) + "%";
}

function month() {
  const timeNow = moment();
  const nextMonth = moment().add(1, "month").startOf("month");
  let diffMonth = moment(nextMonth).diff(timeNow);
  let tillNextMonth = moment.duration(diffMonth).as("minutes");
  let monthPercentage =
    (60 * 24 * timeNow.daysInMonth() - tillNextMonth) /
    (60 * 24 * timeNow.daysInMonth());
  return Math.floor(monthPercentage * 100) + "%";
}

function week() {
  const timeNow = moment();
  const nextWeek = moment().endOf("isoWeek");
  let diffWeek = moment(nextWeek).diff(timeNow);
  let tillNextWeek = moment.duration(diffWeek).as("minutes");
  let weekPercentage = (10080 - tillNextWeek) / 10080;
  return Math.floor(weekPercentage * 100) + "%";
}

function day() {
  const timeNow = moment();
  const nextDay = moment().add(1, "day").startOf("day");
  let diffDay = moment(nextDay).diff(timeNow);
  let tillNextDay = moment.duration(diffDay).as("seconds");
  let dayPercentage = (86400 - tillNextDay) / 86400;
  return Math.floor(dayPercentage * 100) + "%";
}

function hour() {
  const timeNow = moment();
  const nextHour = moment().add(1, "hours").startOf("hour");
  let diffHour = moment(nextHour).diff(timeNow);
  let tillNextHour = moment.duration(diffHour).as("seconds");
  let hourPercentage = (3600 - tillNextHour) / 3600;
  return Math.floor(hourPercentage * 100) + "%";
}

function minute() {
  const timeNow = moment();
  const nextMinute = moment().add(1, "minutes").startOf("minute");
  let diffMinute = moment(nextMinute).diff(timeNow);
  let tillNextMinute = moment.duration(diffMinute).as("milliseconds");
  let minutePercentage = (60000 - tillNextMinute) / 60000;
  return Math.floor(minutePercentage * 100) + "%";
}

module.exports = {
  name: "tp",
  description: "Shows time in percentages.",
  execute(msg, args, bot) {
    let embed = new EmbedBuilder()
      .setAuthor({ name: "Time in percentages", iconURL: bot.user.avatarURL() })
      .setColor(0xf66464)
      .addFields(
        { name: "Minute", value: minute(), inline: true },
        { name: "Hour", value: hour(), inline: true },
        { name: "Day", value: day(), inline: true },
        { name: "Week", value: week(), inline: true },
        { name: "Month", value: month(), inline: true },
        { name: "Year", value: year(), inline: true },
        { name: "Decade", value: decade(), inline: true }
      )
      .setFooter({ text: moment().format("MMMM Do YYYY, HH:mm:ss") });
    msg.channel.send({ embeds: [embed] });
  },
};